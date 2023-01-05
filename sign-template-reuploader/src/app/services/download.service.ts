import { Injectable } from '@angular/core';
import {SourceSettings} from '../settings/source-settings';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class DownloadService {

  private libraryDocumentsBaseURL: string = SourceSettings.sourceBaseUri + 'libraryDocuments';

  constructor(private http: HttpClient) { }

  async getAllDocuments(): Promise<any> {
     const headers = new HttpHeaders()
       .set('Authorization', 'Bearer ' + SourceSettings.sourceIntegrationKey);

     let obs: Observable = this.http.get(
       this.libraryDocumentsBaseURL,
       {
         'observe': 'response',
         'headers': headers
       });

     return obs.toPromise();
  }

  async getDocument(documentId: string): Promise<any> {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + SourceSettings.sourceIntegrationKey);

    let obs: Observable = this.http.get(
      this.libraryDocumentsBaseURL + '/' + documentId,
      {
        'observe': 'response',
        'headers': headers
      });

    return obs.toPromise();
  }

  async getFormFields(documentId: string): Promise<any> {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + SourceSettings.sourceIntegrationKey);

    const obs: Observable = this.http.get(
      this.libraryDocumentsBaseURL + '/' + documentId + '/' + 'formFields',
      {
        'observe': 'response',
        'headers': headers
      });

    return obs.toPromise();
  }
}
