import {httpRequest} from '../util/electron-functions';
import {Settings} from '../settings/settings';

/* 
  - apiEnv needs to be specified if and only if complianceLevel.toLower() === 'fedramp'

    Returns the base URI that is used to access the Adobe Sign API.
*/
export async function getApiBaseUri(bearerToken: string = '', complianceLevel: string = '', apiEnv = Settings.apiEnv) {
  /* If the account is commercial, then the URI returned by this function depends on what shard (e.g. na1, na2, na3, na4)
  the account is on; we use an API call to determine the return value. */
  if (complianceLevel.toLowerCase() === 'commercial') {
    if (bearerToken === '')
      throw new Error('The empty string was passed as the bearerAuth argument in a call to getApiBaseUri().')      
    
    const requestConfig = {
      'method': 'get',
      'url': 'https://api.na1.adobesign.com/api/rest/v6/baseUris',
      'headers': {Authorization: `Bearer ${bearerToken}`}
    };
    const response = (await httpRequest(requestConfig));
    let baseUri = response['apiAccessPoint'];
    baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
    return baseUri;
  }
  /* All FedRamp accounts are on the na1 shard, so we can hardcode the returned value for FedRamp accounts. */
  else if (complianceLevel.toLowerCase() === 'fedramp') {
    if (apiEnv.toLowerCase() === 'stage')
      return 'https://api.na1.adobesignstage.us/api/rest/v6';
    else if (apiEnv.toLowerCase() === 'prod')
      return 'https://api.na1.adobesign.us/api/rest/v6'
    else
      throw new Error('apiEnv.toLowerCase() must be "stage" or "prod".');
  }
  else
    throw new Error('complianceLevel.toLowerCase() must be "commercial" or "fedramp".');
}

/* 
  When using this function for a commercial account (complianceLevel === 'commercial'), one will have to postpend either the string
  'public/oauth/v2' or a string of the form `/oauth/v2/${str}` to access typical OAuth endpoints. (The first option
  is only used for the authorization grant request.)
  
  When using this function for a FedRamp account (complianceLevel === 'fedramp'), one will have to postpend a string of 
  the form `/api/v1/${str}` to access typical OAuth endpoints.  
*/
export function getOAuthBaseUri(complianceLevel: string = '', apiEnv = Settings.apiEnv): string {
  if (complianceLevel.toLowerCase() === 'commercial') {
    if (apiEnv.toLowerCase() === 'stage')
      return 'https://secure.na1.adobesignstage.com';
    else if (apiEnv.toLowerCase() === 'prod')
      return 'https://secure.na1.adobesign.com';
    else
      throw new Error('apiEnv.toLowerCase() must be "stage" or "prod".');
  }
  else if (complianceLevel.toLowerCase() === 'fedramp') {
    if (apiEnv.toLowerCase() === 'stage')
      return 'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice';
    else if (apiEnv.toLowerCase() === 'prod')
      return 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice';
    else
      throw new Error('apiEnv.toLowerCase() must be "stage" or "prod".');
    }
    else
      throw new Error('complianceLevel.toLowerCase() must be "commercial" or "fedramp".');
}

export function getOAuthAuthorizationGrantRequestEndpoint(complianceLevel: string) {
  if (complianceLevel.toLowerCase() === 'commercial')
    return '/public/oauth/v2';
  else if (complianceLevel.toLowerCase() === 'fedramp')
    return '/api/v1/authorize';
  else
    throw new Error('complianceLevel.toLowerCase() must be "commercial" or "fedramp".');
}

export function getOAuthTokenRequestEndpoint(complianceLevel: string) {
  if (complianceLevel.toLowerCase() === 'commercial')
    return '/oauth/v2/token';
  else if (complianceLevel.toLowerCase() === 'fedramp')
    return '/api/v1/token';
  else
    throw new Error('complianceLevel.toLowerCase() must be "commercial" or "fedramp".');
}

export function getPdfLibraryBaseUri(apiEnv = Settings.apiEnv) : string {
  return 'https://secure.na4.adobesign.com/document/cp';
}