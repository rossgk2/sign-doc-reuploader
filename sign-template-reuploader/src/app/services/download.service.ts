import {Injectable} from '@angular/core';
import {getApiBaseUriFedRamp, getApiBaseUriCommercial, getOAuthBaseUri} from '../util/url-getter';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DownloadService {

  constructor(private http: HttpClient) 
  { }

  /* Helper function. */
  defaultHttpOptions(bearerAuth: string): any
  {
    const headers: HttpHeaders = new HttpHeaders().set('Authorization', `Bearer ${bearerAuth}`);
    return {'observe': 'response', 'headers': headers};
  }

  async getAllDocuments(bearerAuth: string): Promise<any> {
    const baseUrl = await getApiBaseUriCommercial(this.http, bearerAuth);
    return this.http.get(`${baseUrl}/libraryDocuments`, this.defaultHttpOptions(bearerAuth)).toPromise();
  }
}
