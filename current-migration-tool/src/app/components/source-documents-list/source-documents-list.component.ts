/* Regular Angular stuff */
import {Component, OnInit, HostListener} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {UrlTree, Router, UrlSerializer} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';

/* Services */
import {OAuthService, OAuthGrantRequest} from '../../services/oauth.service';

/* Utilities */
import {getRandomId} from '../../util/random';
import {httpRequest, redirect, getCurrentUrl} from '../../util/electron-functions';
import {tab} from '../../util/spacing';
import {getApiBaseUriFedRamp, getApiBaseUriCommercial, getOAuthBaseUri, getPdfLibraryBaseUri} from '../../util/url-getter';

/* User-defined configuration */
import {Credentials} from '../../settings/credentials';

/* RxJS Observables and support for vanilla JS Promises */
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';

/* Settings */
import {Settings} from '../../settings/settings';

/* For debug purposes. */
import {saveAs} from 'file-saver';

/*
  ===================================================================
  Helpful wiki articles
  ===================================================================

  OAuth for commercial:
  https://secure.na1.adobesign.com/public/static/oauthDoc.jsp

  OAuth for FedRamp:
  https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=~kmashint&title=Adobe+Acrobat+Sign+and+US+Gov+Cloud+-+FedRAMP+Moderate#AdobeAcrobatSignandUSGovCloudFedRAMPModerate-Authorize

  Commercial vs. FedRamp:
  https://wiki.corp.adobe.com/display/ES/API+Application+Commercial+vs+Gov+Cloud
  
  ===================================================================

  We are currently implementing OAuth for FedRamp. After we do that it'd probably be a good idea to add the implementation
  for commercial.
*/

@Component({
  selector: 'app-source-documents-list',
  templateUrl: './source-documents-list.component.html',
  styleUrls: ['./source-documents-list.component.scss']
})
export class SourceDocumentsListComponent implements OnInit {
  
  /* Reactive forms. */

  migrationToolForm = this.formBuilder.group(
  {
    documents: this.formBuilder.array([]),
    consoleMessages: this.formBuilder.array([])
  });

  get documents(): FormArray<FormGroup> {
    return this.migrationToolForm.controls['documents'] as FormArray;
  }

  readyForDownload: boolean = false;

  populateDocForm(libraryDocuments: any[]) {
    this.readyForDownload = true;
    libraryDocuments.forEach(template => {
      const documentForm = this.formBuilder.group({
        name: [template.name],
        isSelected: [true]
      });
      this.documents.push(documentForm);
    });
  }

  get consoleMessages() {
    return this.migrationToolForm.controls['consoleMessages'] as FormArray;
  }

  logToConsole(message: string) {
    this.consoleMessages.push(this.formBuilder.control(message));
  }

  logToConsoleTabbed(message: string) {
    this.logToConsole(tab() + message);
  }

  /* Internal variables. */
  private static previousUrl: string = window.location.href; // the URL that hosts this webapp before user is redirected
  private redirectUri = 'https://migrationtool.com';
  private bearerAuth = '';
  private refreshToken = '';
  private documentIds: string[] = [];

  /* Fields input by user. */
  private selectedDocs: boolean[] = [];
  
  _commercialIntegrationKey: string = '';
  _oAuthClientId: string = '';
  _oAuthClientSecret: string = '';
  _loginEmail: string = '';

  get commercialIntegrationKey() {
    if (Settings.forceUseTestCredentials)
      return Credentials.commercialIntegrationKey;
    else
      return this._commercialIntegrationKey;
  }

  get oAuthClientId() {
    if (Settings.forceUseTestCredentials)
      return Credentials.oAuthClientId;
    else
      return this._oAuthClientId;
  }

  get oAuthClientSecret() {
    if (Settings.forceUseTestCredentials)
      return Credentials.oAuthClientSecret;
    else
      return this._oAuthClientSecret;
  }
  
  get loginEmail() {
    if (Settings.forceUseTestCredentials)
      return Credentials.loginEmail;
    else
      return this._loginEmail;
  } 

  constructor(private formBuilder: FormBuilder,
              private oAuthService: OAuthService,
              private router: Router,
              private serializer: UrlSerializer,
              private http: HttpClient
              ) {}

  async getDocumentList(): Promise<any> {
    const baseUrl = await getApiBaseUriCommercial(this.http, this.commercialIntegrationKey);
    const requestConfig = this.getDefaultRequestConfig(this.commercialIntegrationKey);
    
    /* Get all library documents. */
    const pageSize = 100;
    let libraryDocuments: any[] = [];
    let obs: Observable<any>; let response;
    let cursorQueryString = '';
    let done = false;
    for (let i = 1; !done; i ++) {
      obs = this.http.get(`${baseUrl}/libraryDocuments?pageSize=${pageSize}` + cursorQueryString, requestConfig);
      response = (await obs.toPromise()).body;
      libraryDocuments = libraryDocuments.concat(response.libraryDocumentList);
      const cursor = response.page.nextCursor;
      if (cursor !== undefined)
        cursorQueryString = `&cursor=${cursor}`;
      else
        done = true;

      this.logToConsole(`Loaded more than ${(i - 1) * pageSize} and at most ${i * pageSize} documents from the commercial account.`);
    }
    this.logToConsole(`Done loading. Loaded ${libraryDocuments.length} documents from the commercial account.`)

    /* Initalize documentIds. */
    const oldThis = this;
    libraryDocuments.forEach(function(doc: any) {
      oldThis.documentIds.push(doc.id);
    });
    
    /* Set up the FormArray that will be used to display the list of documents to the user. */
    this.populateDocForm(libraryDocuments); 
  }

  /* ===========================================================================
   * ===========================================================================
   * =========================================================================== 
   */

  async reupload(): Promise<any> {
    /* Get a list of all the indices cooresponding to documents that the user wants to upload. */
    const oldThis = this;
    this.documents.controls.forEach(function(group) {
      oldThis.selectedDocs.push(group.value.isSelected); // in this context, '' functions as true and false as false
    });

    const numSelectedDocs = this.selectedDocs.filter(function(b) { return b; }).length;

    /* For each document: if that document was selected, upload it. */
    const startTime = Date.now();
    const minutesPerMillisecond = 1.667E-5;
    const timeoutPeriodInMinutes = 5; // hardcoded for now; later we can grab this value from initial response from /token
    const epsilonInMinutes = (1/50) * timeoutPeriodInMinutes; 
    for (let i = 0; i < this.selectedDocs.length; ) {
      /* Determine how much time has elapsed since the start of this function and declare a helper function. */
      const totalTimeElapsedInMinutes = (Date.now() - startTime) * minutesPerMillisecond;
      console.log('totalTimeElapsedInMinutes:', totalTimeElapsedInMinutes);
      console.log('If in the following comparison if we have LHS < RHS, then the current time is considered close to the time at which the token expires.');
      console.log(`${totalTimeElapsedInMinutes % (timeoutPeriodInMinutes - 1)} < ${epsilonInMinutes}`);
    
      /* If the token is about to expire, use a refresh token to get a new token and a new refresh token. */
      const tokenAboutToExpire: boolean = this.closeToNonzeroMultipleOf(totalTimeElapsedInMinutes, timeoutPeriodInMinutes - 1, epsilonInMinutes);
      if (tokenAboutToExpire) {
        const tokenResponse = await this.oAuthService.refreshToken(this.oAuthClientId, this.oAuthClientSecret, this.refreshToken);
        this.bearerAuth = tokenResponse.accessToken; this.refreshToken = tokenResponse.refreshToken;
      }

      this.logToConsole(`Beginning migration of document ${i + 1} of the ${numSelectedDocs} documents.`);
      /* Try to reupload the ith document. Only proceed to the next iteration if we succeed. */
      let error = false;
      try {
        if (this.selectedDocs[i])
          await this.reuploadHelper(this.documentIds[i]);
      } catch (err) {
        error = true;
        this.logToConsole(`Migration of document ${i + 1} of the ${numSelectedDocs} failed. Retrying migration of document ${i + 1}.`);
      }
      if (!error) {
        this.logToConsole(`Document ${i + 1} of the ${numSelectedDocs} documents has been sucessfully migrated.`);
        this.logToConsole('========================================================================');
        i ++;
      }
    }
  }

  async reuploadHelper(documentId: string): Promise<any> {
    this.logToConsole('About to inspect this document in the commercial account and then download it from the commercial account.');
    this.logToConsoleTabbed(`The ID of this document in the commercial account is ${documentId}.`);
    const result = await this.download(documentId, this.commercialIntegrationKey);
    
    /* For debug purposes, save the blob to a PDF to check that we downloaded the PDF correctly. 
    The PDF will be saved to the Downloads folder. */
    // saveAs(result.pdfBlob, 'debug.pdf');

    this.logToConsole('About to upload this document to the FedRamp account.');
    await this.upload(result.docName, result.formFields, result.pdfBlob, documentId);
  }

  async download(documentId: string, bearerAuth: string): Promise<any> {
    const baseUri = await getApiBaseUriCommercial(this.http, bearerAuth);    
    const defaultRequestConfig = this.getDefaultRequestConfig(bearerAuth);

    /* GET the name of the document. */
    let obs: Observable<any> = this.http.get(`${baseUri}/libraryDocuments/${documentId}`, defaultRequestConfig);
    const docName: string = (await obs.toPromise()).body.name;
    this.logToConsoleTabbed(`The name of this document in the commercial account is "${docName}"`);

    /* GET the values the user has entered into the document's fields. */
    obs = this.http.get(`${baseUri}/libraryDocuments/${documentId}/formFields`, defaultRequestConfig);
    const formFields: {[key: string]: string}[] = (await obs.toPromise()).body;
    this.logToConsoleTabbed(`Obtained the values the user entered into this document's fields.`);

    /* GET the PDF on which the custom form fields that the user field out were placed.*/
    obs = this.http.get(`${baseUri}/libraryDocuments/${documentId}/combinedDocument/url`, defaultRequestConfig);
    const combinedDocumentUrl = (await obs.toPromise()).body.url;
    this.logToConsoleTabbed(`The PDF representation of this document is located at ${combinedDocumentUrl}.`);

    /* Save the PDF. */
    const requestConfig = <any>{'observe': 'response', 'responseType': 'blob'};
    
    // To avoid CORS errors, use a proxied URL to make the request.
    // (Postman gives no CORS errors).
    const prefixEndIndex = 'https://secure.na4.adobesign.com/document/cp/'.length - 1; // hardcoded
    const endIndex = combinedDocumentUrl.length - 1;
    const combinedDocumentUrlSuffix = combinedDocumentUrl.substring(prefixEndIndex + 1, endIndex + 1);
    console.log('combinedDocumentUrlSuffix: ', combinedDocumentUrlSuffix);
    const proxiedCombinedDocumentUrl = `/${getPdfLibraryBaseUri()}/${combinedDocumentUrlSuffix}`; // See proxy.conf.ts.
    obs = this.http.get(proxiedCombinedDocumentUrl, requestConfig);
    const pdfBlob = (await obs.toPromise()).body;
    this.logToConsoleTabbed(`Downloaded the PDF of this document.`);

    return {'docName': docName, 'formFields': formFields, 'pdfBlob' : pdfBlob};
  }

  async upload(docName: string, formFields: {[key: string]: string}, pdfBlob: Blob, documentId: string) {
    const baseUri = getApiBaseUriFedRamp();
    const defaultRequestConfig = await this.getDefaultRequestConfig(this.bearerAuth);

    /* POST the same document (but without any custom form fields) as a transient document and get its ID.
    (Informed by https://stackoverflow.com/questions/53038900/nodejs-axios-post-file-from-local-server-to-another-server). */
    const formData = new FormData();
    formData.append('File-Name', docName);
    formData.append('File', pdfBlob);
    const headers = defaultRequestConfig.headers.append('boundary', getRandomId());
    const requestConfig = <any>{'observe': 'response', 'headers': headers};

    let obs: Observable<any> = this.http.post(`/fedramp-api/transientDocuments`, formData, requestConfig); // See proxy.conf.ts.
    const response = (await obs.toPromise()).body;
    const transientDocumentId = response.transientDocumentId;

    this.logToConsoleTabbed(`Uploaded the downloaded PDF to the FedRamp account as a transient document with a transientDocumentId of ${transientDocumentId}.`);

    /* Create a library document from the just-created transient document. */
    const libraryDocumentInfo = 
    {
      'fileInfos' : [{'transientDocumentId' : transientDocumentId}],
      'name': '(From Angular reuploader program) ' + docName,
      'sharingMode': 'ACCOUNT', // can be 'USER' or 'GROUP' or 'ACCOUNT' or 'GLOBAL'
      'state': 'AUTHORING', // can be 'AUTHORING' or 'ACTIVE'
      'templateTypes': ['DOCUMENT'] // each array elt can be 'DOCUMENT' or 'FORM_FIELD_LAYER'
    };
  
    // http.post() is supposed to use 'Content-Type': 'application/json' by default,
    // but that doesn't happen with this request for some reason. So
    // we can't use defaultRequestConfig for this request.
    const headers2 = defaultRequestConfig.headers.append('Content-Type', 'application/json');
    const requestConfig2 = <any>{'observe': 'response', 'headers': headers2};
    obs = this.http.post(`${baseUri}/libraryDocuments`, JSON.stringify(libraryDocumentInfo), requestConfig2);
    const newLibraryDocumentId = (await obs.toPromise()).body.id;
    this.logToConsoleTabbed(`Created a library document (a template) in the FedRamp account from the transient document with a libraryDocumentId of ${newLibraryDocumentId}.`);

    /* Use a PUT request to add the custom form fields and the values entered earlier to the document. */
    obs = this.http.put(`${baseUri}/libraryDocuments/${newLibraryDocumentId}/formFields`, JSON.stringify(formFields), requestConfig2);
    console.log('PUT response:', (await obs.toPromise()).body);
    this.logToConsoleTabbed("Wrote the values the user entered into this document's fields to the library document in the FedRamp account.");
  }

  getDefaultRequestConfig(bearerAuth: string): any {
    const defaultHeaders = new HttpHeaders().set('Authorization', `Bearer ${bearerAuth}`);
    return {'observe': 'response', 'headers': defaultHeaders};
  }

  /* ===========================================================================
   * ===========================================================================
   * =========================================================================== 
   */

  /* There's probably a better implementation of this function. */
  async redirected(): Promise<boolean> {
    const currentUrl: string = await getCurrentUrl(); // window.location.href;
    console.log('currentUrl from Electron', currentUrl);
    const currentUrlProcessed: string = currentUrl.substring('https:/'.length, currentUrl.length);
    const tree: UrlTree = this.serializer.parse(currentUrlProcessed); // urls passed to serializer.parse() must begin with '/'
    return tree.queryParams.hasOwnProperty('code') || tree.queryParams.hasOwnProperty('error');
  }
 
  async login(): Promise<any> {
    console.log("login clicked.")

    if (!(await this.redirected())) {
      /* Get the URL, the "authorization grant request", that the user must be redirected to in order to log in.*/
      const authGrantRequest = this.oAuthService.getOAuthGrantRequest(this.oAuthClientId, this.redirectUri, this.loginEmail, 'FedRamp');
      // TO-DO: store authGrantRequest.state with the ngrx store
      console.log(`Authorization grant request URL: ${authGrantRequest.url}`);

      /* Redirect the user to the URL that is the authGrantRequest. */
      window.location.href = authGrantRequest.url;
    }
  }

  async ngOnInit(): Promise<any> {
    console.log("ngOnInit() called.");

    /* Tests of functions from electron-functions.ts. */
    const requestConfig = {
      method: "get",
      url: `https://pokeapi.co/api/v2/pokemon/treecko`,
    };
    const testResponse = await httpRequest(requestConfig);
    console.log(testResponse);

    console.log('getCurrentUrl()', await getCurrentUrl());

    /* Initalization code for when the user lands on the homepage. */
    if (!(await this.redirected())) {
      this.logToConsole('Welcome to the Adobe Sign Commercial-to-FedRamp Migration Tool.');
      this.logToConsole('Please enter credentials below and then click "Log in".')
    }

    /* In the below, this.router.url will be '/' unless we wait for the page to load. Hacky but works for now. */
    await this.delay(2);

    /* Initalization code for when the user is redirected to the migration UI. */
    if (await this.redirected()) {
      const state = '12345'; // TO-DO: get the stored state from the ngrx store 
      const authGrant = this.oAuthService.getAuthGrant(this.router.url, state);
      const tokenResponse = await this.oAuthService.getToken(this.oAuthClientId, this.oAuthClientSecret, authGrant, this.redirectUri);
      this.bearerAuth = tokenResponse.accessToken; this.refreshToken = tokenResponse.refreshToken;
      console.log('bearerAuth', this.bearerAuth);
    } 
  }

  /* Helper functions for use in this .ts file. */

  /* Returns true if and only if s is not epsilon-close to zero and s is epsilon-close to a multiple of t. */
  private closeToNonzeroMultipleOf(s: number, t: number, epsilon: number): boolean {
    return (s > epsilon) && ((s % t) < epsilon);
  }

  delay(seconds: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  /* Helper functions for use in .html file. */

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
