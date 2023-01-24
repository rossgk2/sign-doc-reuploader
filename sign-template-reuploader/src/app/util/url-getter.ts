import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export function getApiBaseUriFedRamp(inDevelopment: boolean): string {
  if (inDevelopment)
    return 'https://api.na1.adobesignstage.us/api/rest/v6/';
  else
    return 'https://api.na1.adobesign.us/api/rest/v6/'
}

export function getApiBaseUriCommercial(bearerAuth: string): Promise<any> {
  const defaultRequestConfig = <any>{'observe': 'response', 'headers': {Authorization: `Bearer ${bearerAuth}`}};
  const obs: Observable<any> = this.http.get('https://api.na1.adobesign.com/api/rest/v6/baseUris', defaultRequestConfig);
  const response = (await obs.toPromise()).body;
  let baseUri = response['apiAccessPoint'];
  baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
  return baseUri;
}

export function getOAuthBaseUri(inDevelopment: boolean): string {
  if (inDevelopment)
    return 'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice';
  else
    return 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice';
}