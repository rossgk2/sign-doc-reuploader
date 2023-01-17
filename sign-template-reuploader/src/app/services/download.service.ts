import {Injectable} from '@angular/core';
import {SourceSettings} from '../settings/source-settings';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DownloadService {

  private libraryDocumentsBaseUrl: string = SourceSettings.sourceBaseUriFedRamp + 'libraryDocuments';

  constructor(private http: HttpClient) { }

  async getAllDocuments(bearerAuth: string): Promise<any> {
     const headers = new HttpHeaders()
       .set('Authorization', 'Bearer ' + bearerAuth);

     const obs: Observable<any> = this.http.get(
       this.libraryDocumentsBaseUrl,
       { 'observe': 'response', 'headers': headers }
     );

     return obs.toPromise();
  }

  async getDocument(documentId: string, bearerAuth: string): Promise<any> {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + bearerAuth);

    const obs: Observable<any> = this.http.get(
      this.libraryDocumentsBaseUrl + '/' + documentId,
      { 'observe': 'response', 'headers': headers }
    );

    return obs.toPromise();
  }

  async getFormFields(documentId: string, bearerAuth: string): Promise<any> {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Authorization','Bearer ' + bearerAuth);

    const obs: Observable<any> = this.http.get(
      this.libraryDocumentsBaseUrl + '/' + documentId + '/' + 'formFields',
      { 'observe': 'response', 'headers': headers }
    );

    return obs.toPromise();
  }
}
