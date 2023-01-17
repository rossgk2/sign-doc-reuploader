/* Regular Angular stuff */
import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {UrlTree, Router, UrlSerializer} from '@angular/router';

/* Services */
import {DownloadService} from '../../services/download.service';
import {OAuthService} from '../../services/oauth.service';

/* User-defined configuration. */
import {Credentials} from '../../settings/credentials';

/* ngrx stores */
import {select, Store} from '@ngrx/store';
import {setVariable} from '../../store/actions';
import {reducer} from '../../store/reducer'

/* RxJS Observables and support for vanilla JS Promises. */
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-source-documents-list',
  templateUrl: './source-documents-list.component.html',
  styleUrls: ['./source-documents-list.component.scss']
})

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

export class SourceDocumentsListComponent implements OnInit {
  
  /* Fields internal to this component. */
  private documentListForm = this.formBuilder.group({
    documents: this.formBuilder.array([])
  });
  private static previousUrl: string = window.location.href; // the URL that hosts this webapp before user is redirected
  private redirectUri: string = 'https://migrationtooldev.com';
  private bearerAuth: string;
  private documentIds: string[] = [];
  private readyForDownload: boolean = false;

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
  private oAuthClientId: string = '';
  private clientSecret: string = '';
  private loginEmail: string = '';

  /* Temp hardcoded variables that simulate user input. */
  private _oAuthClientId = Credentials._oAuthClientId;
  private _oAuthClientSecret = Credentials._oAuthClientSecret;
  private _loginEmail = Credentials._loginEmail;

  constructor(private formBuilder: FormBuilder,
              private downloadService: DownloadService,
              private oauthService: OAuthService,
              private router: Router,
              private serializer: UrlSerializer,
              private store: Store<{'oAuthState': string}>
              ) {}

  get documents() {
    return this.documentListForm.controls['documents'] as FormArray;
  }

  populateDocForm(libraryDocumentList: any) {
    this.readyForDownload = true;
    libraryDocumentList.forEach(template => {
      const documentForm = this.formBuilder.group({
        name: [template.name],
        include: ['']
      });
      this.documents.push(documentForm);
    });
  }

  async getDocumentList(): Promise<any> {
    console.log('bearerAuth:', this.bearerAuth);
    const response = await this.downloadService.getAllDocuments(this.bearerAuth);    
    if (response.status === 200) {
        /* Get the libraryDocumentList from the response.
        Note, TS doesn't know that response.body has a libraryDocumentList without the cast here. */
        const libraryDocumentList: any = (response.body as any).libraryDocumentList;

        /* Initalize documentIds. */
        const oldThis = this;
        libraryDocumentList.forEach(function(doc: any) {
          oldThis.documentIds.push(doc.id);
        });
        
        /* Set up the FormArray that will be used to display the list of documents to the user. */
        this.populateDocForm(libraryDocumentList); 
      }
  }

  upload(): void {
    /* Get a list of all the indices cooresponding to documents that the user wants to upload. */
    const oldThis = this;
    this.documents.controls.forEach(function(group: FormGroup) {
      oldThis.selectedDocs.push(group.value.include !== false); // in this context, '' functions as true and false as false
    });

    /* For each document: if that document was selected, upload it. */
    const temp = 1; // once done getting uploadHelper() working, delete "&& i < temp" in the below
    for (let i = 0; i < this.selectedDocs.length && i < temp; i ++) {
      if (this.selectedDocs[i])
        this.uploadHelper(this.documentIds[i]);
    }
  }

  uploadHelper(documentId: string): void {
    console.log(`Uploading document with the following ID: ${documentId}`);
    console.log(`OAuth client_id: ${this.oAuthClientId}`);
    console.log(`email: ${this._loginEmail}`);

    /* Adapt the existing reuploader program and put it here: */
    /* ===== */
    /* TO-DO */
    /* ===== */
  }

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
      /* Real program will do the following. For now, use hardcoded params. */
      // console.log(this.oauthService.getOAuthRequestAuthGrantURL(this.oAuthClientId, this.loginEmail)); 

      const authGrantRequest = this.oauthService.getOAuthGrantRequest(this._oAuthClientId, this.redirectUri, this._loginEmail, 'FedRamp');
      console.log('About to store oAuthState!')
      this.setOAuthState(authGrantRequest.initialState);
      console.log('oAuthState has been stored.');
      console.log(`Authorization grant request URL: ${authGrantRequest.url}`);
      console.log(`oAuthState (before): ${authGrantRequest.initialState}`);
    }
  }

  async ngOnInit(): Promise<any> {
    console.log("ngOnInit() called.");

    if (!this.redirected()) {
      console.log('Testing that setOAuthState() and getOAuthState() work...')
      const oAuthState0 = 'lololol';
      console.log(`Calling setOAuthState('${oAuthState0}')`);
      this.setOAuthState(oAuthState0);
      console.log(`getOAuthState() return value: ${await this.getOAuthState()}`);
    }

    await this.delay(2); // Thought maybe this would make sure we don't access store before it's injected

    if (this.redirected()) {
      const initialState = await this.getOAuthState();
      console.log('Initial state (after):', initialState);
      const authGrant = this.oauthService.getAuthGrant(this.router.url, initialState);
      this.bearerAuth = await this.oauthService.getToken(this._oAuthClientId, this._oAuthClientSecret, authGrant, this.redirectUri);
    }
  }

  /* Helper functions for use in this .ts file. */

  delay(seconds): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  /* Helper functions for use in .html file. */

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
