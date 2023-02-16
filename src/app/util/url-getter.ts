import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Settings} from '../settings/settings';

export function getApiBaseUriFedRamp(inDevelopment = Settings.inDevelopment, useProxy = Settings.useProxy): string {
  if (!useProxy) {
    if (inDevelopment)
      return 'https://api.na1.adobesignstage.us/api/rest/v6';
    else
      return 'https://api.na1.adobesign.us/api/rest/v6'
  }
  else
    return '/fedramp-api';
}

export async function getApiBaseUriCommercial(http: HttpClient, bearerAuth: string, // using these two args is kind of hacky
                      inDevelopment = Settings.inDevelopment, useProxy = Settings.useProxy): Promise<any> {
  if (!useProxy) {
    const defaultRequestConfig = <any>{'observe': 'response', 'headers': {Authorization: `Bearer ${bearerAuth}`}};
    const obs: Observable<any> = http.get('https://api.na1.adobesign.com/api/rest/v6/baseUris', defaultRequestConfig);
    const response = (await obs.toPromise()).body;
    let baseUri = response['apiAccessPoint'];
    baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
    return baseUri;
  }
  else
    return '/commercial-api';
}

export function getOAuthBaseUri(inDevelopment = Settings.inDevelopment, useProxy = Settings.useProxy): string {
  if (!useProxy) {
    if (inDevelopment)
      return 'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice';
    else
      return 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice';
  }
  else
    return '/oauth-api';
}

export function getPdfLibraryBaseUri(inDevelopment = Settings.inDevelopment, useProxy = Settings.useProxy) : string {
  if (!useProxy)
    return 'https://secure.na4.adobesign.com/document/cp';
  else
    return 'pdf-api';
}