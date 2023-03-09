import {Injectable} from '@angular/core';
import {httpRequest} from '../util/electron-functions';
import {Observable} from 'rxjs';
import {Settings} from '../settings/settings';

/* Some of these functions don't actually make use of the argument apiEnv; they may in the future,
so we will leave it as is. */

export function getApiBaseUriFedRamp(apiEnv = Settings.apiEnv, useProxy = Settings.useProxy): string {
  if (!useProxy) {
    if (Settings.apiEnv === 'stage')
      return 'https://api.na1.adobesignstage.us/api/rest/v6';
    else if (Settings.apiEnv === 'prod')
      return 'https://api.na1.adobesign.us/api/rest/v6'
    else
      throw new Error('apiEnv must be "stage" or "prod".');
  }
  else
    return '/fedramp-api';
}

export async function getApiBaseUriCommercial(bearerAuth: string, // using this arg is kind of hacky
                      apiEnv = Settings.apiEnv, useProxy = Settings.useProxy): Promise<any> {
  if (!useProxy) {
    const requestConfig = {
      'method': 'get',
      'url': 'https://api.na1.adobesign.com/api/rest/v6/baseUris',
      'headers': {Authorization: `Bearer ${bearerAuth}`}
    };
    const response = (await httpRequest(requestConfig));
    let baseUri = response['apiAccessPoint'];
    baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
    return baseUri;
  }
  else
    return '/commercial-api';
}

export function getOAuthBaseUri(apiEnv = Settings.apiEnv, useProxy = Settings.useProxy): string {
  if (!useProxy) {
    if (Settings.apiEnv === 'stage')
      return 'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice';
    else if (Settings.apiEnv === 'prod')
      return 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice';
    else
      throw new Error('apiEnv must be "stage" or "prod".');
  }
  else
    return '/oauth-api';
}

export function getPdfLibraryBaseUri(apiEnv = Settings.apiEnv, useProxy = Settings.useProxy) : string {
  if (!useProxy)
    return 'https://secure.na4.adobesign.com/document/cp';
  else
    return '/pdf-api';
}