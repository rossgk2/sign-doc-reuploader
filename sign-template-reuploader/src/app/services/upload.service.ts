import { Injectable } from '@angular/core';
import {DestinationSettings} from '../settings/destination-settings';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private libraryDocumentsBase: string = DestinationSettings.destinationBaseUri + 'libraryDocuments';

  constructor(private http: HttpClient) { }

  createTransientDocument(payload: any) {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + DestinationSettings.destinationIntegrationKey);

    return this.http.post(
      this.libraryDocumentsBase + '/transientDocuments',
      payload,
      {
        observe: 'response',
        headers: headers
      });
  }

  createLibraryDocument(documentId: string, payload: any) {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + DestinationSettings.destinationIntegrationKey);

    return this.http.post(
      this.libraryDocumentsBase + '/' + documentId,
      payload,
      {
        observe: 'response',
        headers: headers
      });

  }

  addFormFields(documentId: string, payload: any) {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + DestinationSettings.destinationIntegrationKey);

    return this.http.post(
      this.libraryDocumentsBase + '/' + documentId + '/' + 'formFields',
      payload,
      {
        observe: 'response',
        headers: headers
      });
  }


}
