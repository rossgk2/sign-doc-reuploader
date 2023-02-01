/* Regular Angular stuff */
import {Component, OnInit, HostListener} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {UrlTree, Router, UrlSerializer} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';

/* Services */
import {OAuthService} from '../../services/oauth.service';

/* Utilities */
import {getRandomId} from '../../util/random';
import {tab} from '../../util/spacing';
import {getApiBaseUriFedRamp, getApiBaseUriCommercial, getOAuthBaseUri} from '../../util/url-getter';

/* User-defined configuration */
import {Credentials} from '../../settings/credentials';

/* ngrx stores */
import {select, Store} from '@ngrx/store';
import {setVariable} from '../../store/actions';
import {reducer} from '../../store/reducer'

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

/* TO-DO

  Overall goal: migrate documents from a commercial account to a FedRamp account.

  4. Improve the UI.
  4.1. Make it so that user is redirected once they click "Log in" (no need for using "inspect element" to go to the OAuth redirect).
  4.2. Make it so that the "Display documents from your Sign account" button only appears if redirected() is true.
  
  5. Code style
  5.1. Replace let with const where possible.
  5.2. Replace ' with "
  5.3. Replace objects of the in the style of the example {'a': 1, 'b': 2} with objects of the form in the style
  of {a: 1, b: 2}. I.e., don't use quotes on object properties.
    - Suppose we have const x = {'a': 1, 'b': 2}. Then x.a is the string literal '1' and not the number 1.
    So it's better to define x as const x = {a: 1, b: 2}.

*/

@Component({
  selector: 'app-source-documents-list',
  templateUrl: './source-documents-list.component.html',
  styleUrls: ['./source-documents-list.component.scss']
})
export class SourceDocumentsListComponent implements OnInit {
  
  /* Reactive forms. */

  private migrationToolForm = this.formBuilder.group(
  {
    documents: this.formBuilder.array([]),
    consoleMessages: this.formBuilder.array([])
  });

  get documents() {
    return this.migrationToolForm.controls['documents'] as FormArray;
  }

  private readyForDownload: boolean = false;

  populateDocForm(libraryDocumentList: any) {
    this.readyForDownload = true;
    libraryDocumentList.forEach(template => {
      const documentForm = this.formBuilder.group({
        name: [template.name],
        isSelected: ['']
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

  /* Internal variables. */
  private static previousUrl: string = window.location.href; // the URL that hosts this webapp before user is redirected
  private redirectUri: string = 'https://migrationtool.com';
  private bearerAuth: string;
  private refreshToken: string;
  private documentIds: string[] = [];

  /* An "internal" field that persists across multiple instances of this component. */
  
  async getOAuthState() {
    const state$ = this.store.pipe(select('oAuthState'));
    return (await state$.pipe(first()).toPromise())['oAuthState'];
  }

  setOAuthState(oAuthState: string) {
    
    /*
      setVariable() is an ActionCreator, which is a function that takes in a payload (the payload is
      an object containing data to be persisted) that is to be attatched to the Action it creates.
      
      Thus the below setVariable({ 'oAuthState': oAuthState }) creates an Action with payload { 'oAuthState': oAuthState }.
      
      dispatch(setVariable({ 'oAuthState': oAuthState })) causes all Reducers defined anywhere to process this Action.
      Only some Reducers are configured to respond to any given Action, though. In this app there is one
      Action and one Reducer, and the Reducer is configured to respond to the Action.
    */

    this.store.dispatch(setVariable({ 'oAuthState': oAuthState }));
  }

  /* Fields input by user. */
  private selectedDocs: boolean[] = [];
  
  private _commercialIntegrationKey: string = '';
  private _oAuthClientId: string = '';
  private _oAuthClientSecret: string = '';
  private _loginEmail: string = '';

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
              private store: Store<{'oAuthState': string}>,
              private http: HttpClient
              ) {}

  async getDocumentList(): Promise<any> {
    const baseUrl = await getApiBaseUriCommercial(this.http, this.commercialIntegrationKey);
    const requestConfig =this.getDefaultRequestConfig(this.commercialIntegrationKey);
    const obs: Observable<any> = this.http.get(`${baseUrl}/libraryDocuments`, requestConfig);
    const response = (await obs.toPromise());
    const libraryDocumentList: any = (response.body as any).libraryDocumentList;

    /* Initalize documentIds. */
    const oldThis = this;
    libraryDocumentList.forEach(function(doc: any) {
      oldThis.documentIds.push(doc.id);
    });
    
    /* Set up the FormArray that will be used to display the list of documents to the user. */
    this.populateDocForm(libraryDocumentList); 
  }

  /* ===========================================================================
   * ===========================================================================
   * =========================================================================== 
   */

  async reupload(): Promise<any> {
    /* Get a list of all the indices cooresponding to documents that the user wants to upload. */
    const oldThis = this;
    this.documents.controls.forEach(function(group: FormGroup) {
      oldThis.selectedDocs.push(group.value.isSelected !== false); // in this context, '' functions as true and false as false
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
      console.log('If in the following comparison we have LHS < RHS, then the current time is considered close to the time at which the token expires.');
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
    this.logToConsole('About to download this document from the commercial account.');
    this.logToConsole(`${tab()}The ID of this document in the commercial account is ${documentId}.`);
    const result = await this.download(documentId, this.commercialIntegrationKey);
    
    /* For debug purposes, save the blob to a PDF to check that we downloaded the PDF correctly. 
    The PDF will be saved to the Downloads folder. */
    // saveAs(result.pdfBlob, 'debug.pdf');

    await this.upload(result.docName, result.formFields, result.pdfBlob, documentId);
  }

  async download(documentId: string, bearerAuth: string): Promise<any> {
    const baseUri = await getApiBaseUriCommercial(this.http, bearerAuth);    
    const defaultRequestConfig = this.getDefaultRequestConfig(bearerAuth);

    /* GET the name of the document. */
    let obs: Observable<any> = this.http.get(`${baseUri}/libraryDocuments/${documentId}`, defaultRequestConfig);
    const docName: string = (await obs.toPromise()).body.name;
    this.logToConsole(`The name of the document in the commercial account is ${docName}`);

    /* GET the values the user has entered into the document's fields. */
    obs = this.http.get(`${baseUri}/libraryDocuments/${documentId}/formFields`, defaultRequestConfig);
    const formFields: {[key: string]: string}[] = (await obs.toPromise()).body;
    this.logToConsole(`Obtained the values the user entered into the document's fields.`);

    /* GET the PDF on which the custom form fields that the user field out were placed.*/
    obs = this.http.get(`${baseUri}/libraryDocuments/${documentId}/combinedDocument/url`, defaultRequestConfig);
    const combinedDocumentUrl = (await obs.toPromise()).body.url;
    this.logToConsole(`Obtained a combinedDocumentUrl of ${combinedDocumentUrl}.`);

    /* Save the PDF. */
    const requestConfig = <any>{'observe': 'response', 'responseType': 'blob'};
    
    // To avoid CORS errors, use a proxied URL to make the request.
    const prefixEndIndex = 'https://secure.na4.adobesign.com/document/cp/'.length - 1; // hardcoded
    const endIndex = combinedDocumentUrl.length - 1;
    const combinedDocumentUrlSuffix = combinedDocumentUrl.substring(prefixEndIndex + 1, endIndex + 1);
    const proxiedCombinedDocumentUrl = `/doc-pdf-api/${combinedDocumentUrlSuffix}`; // See proxy.conf.ts.
    obs = this.http.get(proxiedCombinedDocumentUrl, requestConfig);
    const pdfBlob = (await obs.toPromise()).body;

    return {'docName': docName, 'formFields': formFields, 'pdfBlob' : pdfBlob};
  }

  async upload(docName: string, formFields: {[key: string]: string}, pdfBlob: Blob, documentId: string) {
    const baseUri = await getApiBaseUriFedRamp(Settings.inDevelopment);
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

    console.log(`transientDocumentId: ${transientDocumentId}`);

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
    obs = this.http.post(`/fedramp-api/libraryDocuments`, JSON.stringify(libraryDocumentInfo), requestConfig2);
    const newLibraryDocumentId = (await obs.toPromise()).body.id;
    console.log('newLibraryDocumentId:', newLibraryDocumentId);

    /* Use a PUT request to add the custom form fields and the values entered earlier to the document. */
    obs = this.http.put(`${baseUri}/libraryDocuments/${newLibraryDocumentId}/formFields`, JSON.stringify(formFields), requestConfig2);
    console.log('PUT response:', (await obs.toPromise()).body);
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
  redirected(): boolean {
    const currentUrl = window.location.href;
    const currentUrlProcessed = currentUrl.substring('https:/'.length, currentUrl.length);
    const tree: UrlTree = this.serializer.parse(currentUrlProcessed); // urls passed to serializer.parse() must begin with '/'
    return tree.queryParams.hasOwnProperty('code') || tree.queryParams.hasOwnProperty('error');
  }
 
  login(): void {
    console.log("login clicked.")

    if (!this.redirected()) {
      /* Get the URL, the "authorization grant request", that the user must be redirected to in order to log in.*/
      const authGrantRequest = this.oAuthService.getOAuthGrantRequest(this.oAuthClientId, this.redirectUri, this.loginEmail, 'FedRamp');
      console.log(`Authorization grant request URL: ${authGrantRequest.url}`);

      /* Redirect the user to the URL that is the authGrantRequest. */
      window.location.href = authGrantRequest.url;

      /* Experimentation with ngrx stores. Ignore this. */
      console.log('About to store oAuthState!')
      this.setOAuthState(authGrantRequest.initialState);
      console.log('oAuthState has been stored.');
      console.log(`oAuthState (before): ${authGrantRequest.initialState}`);
    }
  }

  async ngOnInit(): Promise<any> {
    console.log("ngOnInit() called.");

    if (!this.redirected()) {
      this.logToConsole('&nbsp;Welcome to the Adobe Sign Commercial-to-FedRamp Migration Tool.');

      console.log('Testing that setOAuthState() and getOAuthState() work...')
      const oAuthState0 = 'test12345';
      console.log(`Calling setOAuthState('${oAuthState0}')`);
      this.setOAuthState(oAuthState0);
      console.log(`getOAuthState() return value: ${await this.getOAuthState()}`);
    }

    await this.delay(2); // Thought maybe this would make sure we don't access store before it's injected

    if (this.redirected()) {
      const initialState = await this.getOAuthState();
      console.log('Initial state (after):', initialState);
      const authGrant = this.oAuthService.getAuthGrant(this.router.url, initialState);
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

  delay(seconds): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  /* Helper functions for use in .html file. */

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
