import { Injectable } from '@angular/core';
import {SourceSettings} from '../settings/source-settings';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private libraryDocumentsBase: string = SourceSettings.sourceBaseUri + 'libraryDocuments';

  constructor(private http: HttpClient) { }

  getAllDocuments() {
     const headers = new HttpHeaders()
       .set('Authorization','Bearer ' + SourceSettings.sourceIntegrationKey)
       .set('Access-Control-Allow-Origin', '*');

     return this.http.get(
       this.libraryDocumentsBase,
       {
         observe: 'response',
         headers: headers
       });
  }

  getDocument(documentId: string) {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + SourceSettings.sourceIntegrationKey);

    return this.http.get(
      this.libraryDocumentsBase + '/' + documentId,
      {
        observe: 'response',
        headers: headers
      });
  }

  getFormFields(documentId: string) {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + SourceSettings.sourceIntegrationKey);

    return this.http.get(
      this.libraryDocumentsBase + '/' + documentId + '/' + 'formFields',
      {
        observe: 'response',
        headers: headers
      });
  }
}
