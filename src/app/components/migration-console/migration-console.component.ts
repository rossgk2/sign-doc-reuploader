import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import axios from 'axios';
import { OAuthService } from '../../services/oauth.service';
import { SharerService } from '../../services/sharer.service';
import { Settings } from '../../settings/settings';
import { httpRequest } from '../../util/electron-functions';
import { tab } from '../../util/spacing';
import { getApiBaseUriCommercial } from '../../util/url-getter';
import { reuploadHelper } from './migration';

@Component({
  selector: 'app-migration-console',
  templateUrl: './migration-console.component.html',
  styleUrls: ['./migration-console.component.scss']
})
export class MigrationConsoleComponent {
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
    this.readyForDownload = true; // causes the "Begin upload" button to appear
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

  async getDocumentList(): Promise<any> {
    const baseUrl = await getApiBaseUriCommercial(this.commercialIntegrationKey);

    /* Get all library documents. */
    const pageSize = 100;
    let libraryDocuments: any[] = [];
    let response;
    let cursorQueryString = '';
    let done = false;
    for (let i = 1; !done; i ++) {
      const requestConfig = {
        'method': 'get',
        'url': `${baseUrl}/libraryDocuments?pageSize=${pageSize}` + cursorQueryString,
        'headers': {'Authorization': `Bearer ${this.commercialIntegrationKey}`}
      };
      response = (await httpRequest(requestConfig));

      libraryDocuments = libraryDocuments.concat(response.libraryDocumentList);
      const cursor = response.page.nextCursor;
      if (cursor !== undefined) {
        cursorQueryString = `&cursor=${cursor}`;
        done = Settings.devPageLimit >= 0 && i >= Settings.devPageLimit;
      }
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

  /* Fields input by user. */
  private selectedDocs: string[] = [];

  /* Internal variables. */
  private bearerAuth = '';
  private refreshToken = '';
  private documentIds: string[] = [];

  /* Fields input by user. */
  commercialIntegrationKey: string = '';
  oAuthClientId: string = '';
  oAuthClientSecret: string = '';
  loginEmail: string = '';

  constructor(private oAuthService: OAuthService,
              private sharerService: SharerService,
              private formBuilder: FormBuilder) { }

  async reupload(): Promise<any> {
    /* Get a list of all the indices cooresponding to documents that the user wants to upload. */
    const oldThis = this;
    let i = 0;
    this.documents.controls.forEach(function(group: any) {
      if (group.value.isSelected) {
        oldThis.selectedDocs.push(oldThis.documentIds[i]);
      }
      i ++;
    });

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

      this.logToConsole(`Beginning migration of document ${i + 1} of the ${this.selectedDocs.length} documents.`);
      /* Try to reupload the ith document. Only proceed to the next iteration if we succeed. */
      let error = false;
      try {
        await reuploadHelper(this, this.selectedDocs[i]);
      } catch (err) {
        error = true;
        this.logToConsole(`Migration of document ${i + 1} of the ${this.selectedDocs.length} failed. Retrying migration of document ${i + 1}.`);
      }
      if (!error) {
        this.logToConsole(`Document ${i + 1} of the ${this.selectedDocs.length} documents has been sucessfully migrated.`);
        this.logToConsole('========================================================================');
        i ++;
      }
    }
  }

  async ngOnInit() {
    /* See preload.ts for the definitions of the functions from api. */

    /* Send a message to the Electron main process indicating that this ngOnInit() method
    has begun executing. */
    (<any> window).api.notifyIsConsoleInitStarted();
    
    /* When the Electron main process recieves the notification sent in the above,
    it sends a message back that, when recieved, results in the invocation of the
    below defined callback function. The message includes a url argument that is
    passed to the callback. */
    const oldThis = this;
    (<any> window).api.onConsoleInitFinish(async function (event: any, url: string) {
      /* Get credentials from earlier. */
      const credentials: any = oldThis.sharerService.shared.credentials;
      oldThis.commercialIntegrationKey = credentials.commercialIntegrationKey;
      oldThis.oAuthClientId = credentials.oAuthClientId;
      oldThis.oAuthClientSecret = credentials.oAuthClientSecret;
      oldThis.loginEmail = credentials.loginEmail;

      /* Use the credentials to get a "Bearer" token from OAuth. */
      const initialOAuthState = oldThis.sharerService.shared.initialOAuthState;
      const authGrant = oldThis.oAuthService.getAuthGrant(url, initialOAuthState);
      const tokenResponse = await oldThis.oAuthService.getToken(oldThis.oAuthClientId, oldThis.oAuthClientSecret, authGrant, Settings.redirectUri);
      oldThis.bearerAuth = tokenResponse.accessToken; oldThis.refreshToken = tokenResponse.refreshToken;
    });
  }

  /* Helper functions. */

  /* Returns true if and only if s is not epsilon-close to zero and s is epsilon-close to a multiple of t. */
  private closeToNonzeroMultipleOf(s: number, t: number, epsilon: number): boolean {
    return (s > epsilon) && ((s % t) < epsilon);
  }

  async delay(seconds: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  /* We should be able to use httpRequest from util/electron-functions.ts instead of this,
  but it seems that requestConfig.data isn't copied correctly (maybe not even copied at all)
  when requestConfig is passed from httpRequest() to the axios() call in electron/main.ts. */
  async httpRequestTemp(requestConfig: any): Promise<any> {
    return (await axios(requestConfig)).data;
  }
}
