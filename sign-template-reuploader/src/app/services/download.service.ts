import {Injectable} from '@angular/core';
import {UrlGetterService} from '../services/url-getter.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DownloadService {

  constructor(private urlGetterService: UrlGetterService,
              private http: HttpClient) 
  { }

  /* Helper function. */
  defaultHttpOptions(bearerAuth: string): any
  {
    const headers: HttpHeaders = new HttpHeaders().set('Authorization', `Bearer ${bearerAuth}`);
    return {'observe': 'response', 'headers': headers};
  }

  async getAllDocuments(bearerAuth: string): Promise<any> {
    const baseUrl = await this.urlGetterService.getApiBaseUriCommercial(bearerAuth);
    return this.http.get(`${baseUrl}/libraryDocuments`, this.defaultHttpOptions(bearerAuth)).toPromise();
  }

  /* Deprecated functions below. */

  async getDocument(documentId: string, bearerAuth: string): Promise<any> {
    const baseUrl = await this.urlGetterService.getApiBaseUriCommercial(bearerAuth);
    return this.http.get(`${baseUrl}/${documentId}`, this.defaultHttpOptions(bearerAuth)).toPromise();
  }

  async getFormFields(documentId: string, bearerAuth: string): Promise<any> {
    const baseUrl = await this.urlGetterService.getApiBaseUriCommercial(bearerAuth);
    return this.http.get(`{baseUrl}/${documentId}/formFields`, this.defaultHttpOptions(bearerAuth)).toPromise();
  }
}
