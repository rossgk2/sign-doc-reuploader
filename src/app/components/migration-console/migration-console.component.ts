import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import axios from 'axios';
import { OAuthService } from '../../services/oauth.service';
import { SharerService } from '../../services/sharer.service';
import { Settings } from '../../settings/settings';
import { httpRequest } from '../../util/electron-functions';
import { tab } from '../../util/spacing';
import { getApiBaseUriCommercial } from '../../util/url-getter';
import { migrate } from './migration';

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
        isSelected: [false]
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
    let selectedDocs: string[] = [];
    const oldThis = this;
    let i = 0;
    this.documents.controls.forEach(function(group: any) {
      if (group.value.isSelected) {
        selectedDocs.push(oldThis.documentIds[i]);
      }
      i ++;
    });

    migrate(this, selectedDocs);
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
