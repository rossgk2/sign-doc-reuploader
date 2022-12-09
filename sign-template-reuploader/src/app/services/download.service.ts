import { Injectable } from '@angular/core';
import {SourceSettings} from '../settings/source-settings';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private libraryDocumentsBaseURL: string = SourceSettings.sourceBaseUri + 'libraryDocuments';

  constructor(private http: HttpClient) { }

  oauthRequestAuthGrant(clientId: string, loginEmail: string) {
    const headers = new HttpHeaders()
       .set('key', 'value'); // TO-DO

    return this.http.get(
      'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice', // does shard have to match that of account?
      {
          'observe': 'response',
          'params':
          {
              'client_id' : clientId,
              'response_type' : 'code',
              'redirect_uri' : 'https://a944-2600-1702-6d0-33e0-59a3-14bc-8669-c8d0.ngrok.io',
              'scope' : 'library_read:account library_write:account agreement_write:account',
              'state' : this.getRandomId(),
              'login_hint' : loginEmail
          },
         'headers': headers
      });
  }

  getAllDocuments() {
     const headers = new HttpHeaders()
       .set('Authorization', 'Bearer ' + SourceSettings.sourceIntegrationKey);

     return this.http.get(
       this.libraryDocumentsBaseURL,
       {
         'observe': 'response',
         'headers': headers
       });
  }

  getDocument(documentId: string) {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + SourceSettings.sourceIntegrationKey);

    return this.http.get(
      this.libraryDocumentsBaseURL + '/' + documentId,
      {
        'observe': 'response',
        'headers': headers
      });
  }

  getFormFields(documentId: string) {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + SourceSettings.sourceIntegrationKey);

    return this.http.get(
      this.libraryDocumentsBaseURL + '/' + documentId + '/' + 'formFields',
      {
        'observe': 'response',
        'headers': headers
      });
  }

  private randomIdHelper(): string { // from https://stackoverflow.com/a/55365334
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  private getRandomId(): string { // from https://stackoverflow.com/a/55365334
    return `${this.randomIdHelper()}${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}${this.randomIdHelper()}${this.randomIdHelper()}`;
  }
}
