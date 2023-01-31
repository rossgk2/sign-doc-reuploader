import {Injectable} from '@angular/core';
import {UrlTree, Router, UrlSerializer} from '@angular/router';
import {Credentials} from '../settings/credentials';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {getRandomId} from '../util/random';
import {getApiBaseUriFedRamp, getApiBaseUriCommercial, getOAuthBaseUri} from '../util/url-getter';
import {Settings} from '../settings/settings';

@Injectable({providedIn: 'root'})
export class OAuthService {

  private oAuthBaseUri: string;

  constructor(private router: Router,
              private serializer: UrlSerializer,
              private http: HttpClient)
  { this.oAuthBaseUri = '/oauth-api/api/v1'; }

  /* 
    Returns a URL which is an "authorizaton grant request". When the user visits this URL,
    they are effectively requesting an authorization grant.

    Also returns a randomly generated state associated with the authorizaton grant request.
    
    Inputs:
      - redirectUri is the URI that the user should be redirected to once they have visited the URL
      that is the authorizaton grant request
      - env must be such that env.toLowerCase() is either 'commercial' or 'fedramp'
  */
  getOAuthGrantRequest(clientId: string, redirectUri: string, loginEmail: string, env: string): {[key: string]: string} {
    const state = getRandomId();
    let scope: string;

    /* The syntax for the 'scope' query param depends on whether the environment is commercial or FedRamp. */
    if (env.toLowerCase() == 'commercial')
      scope = 'library_read:account library_write:account agreement_write:account';
    else if (env.toLowerCase() == 'fedramp')
      /* 'offline_access' is crucial. Instructs the POST to /token in getToken() to return a refresh token. */
      scope = 'library_read library_write agreement_write offline_access';
    else
      throw new Error("env.toLowerCase() must be either 'commercial' or 'fedramp'.");

    /* Build the URL that is the authorizaton grant request. */
    const tree: UrlTree = this.router.createUrlTree([''],
      {
        'queryParams':
        {
              'client_id' : clientId,
              'response_type' : 'code',
              'redirect_uri' : redirectUri,
              'scope' : scope,
              'state' : state,
              'login_hint' : loginEmail
        }
      });

    /* Return the authorizaton grant request and the randomly generated state associated with it. */
    return {
      'url': `${this.oAuthBaseUri}/authorize` + this.serializer.serialize(tree),
      'initialState': state
    };  
  }

  /*
    Inputs:
      - authGrantResponse is a URL whose query params encode the response to the request for an authorization grant.
      - initialState is the state that is sent as a part of the authorization grant request. This function needs to know
      initialState so that it can compare it to authGrantResponse's initialState and thus verify that
      the server sending authGrantResponse is not a malicous actor pretending to be the authorizaton server.  

    Returns a unique string that is the "authorization grant". This authorizaton grant is used to
    request more tokens (access tokens, ID tokens, or refresh tokens).
  */
  getAuthGrant(authGrantResponse: string, initialState: string): string {
    const tree: UrlTree = this.serializer.parse(authGrantResponse);
    
    /* Whether or not the request that generated authGrantResponse depends on which of 
    "error" and "code" is a query param. */

    /* Handle errors. If no errors, check that the server sending the authorizaton grant is
    legitimate, and then return the authorizaton grant. */
    if (tree.queryParams.hasOwnProperty('error')) {
      const errorMessage = 'An erroneous request was made to the OAuth /authorize endpoint.\n' +
      `Error: ${tree.queryParams.error}\nError description: ${tree.queryParams.error_description}`;
      throw new Error(errorMessage);
    }
    else if (tree.queryParams.hasOwnProperty('code')) {
      const code: string = tree.queryParams.code;
      const state: string = tree.queryParams.state;

      // After getting the ngrx store to work, delete "false &&" in order to enable this check.
      if (false && state !== initialState) {
        throw new Error('The state recieved from the server claiming to be authorization server does not match initial state passed to the authorization server.');
      }

      return code;
    }
    else
      throw new Error('The authorization grant URL does not contain a "code" or an "error" query param.');
  }

  async getToken(clientId: string, clientSecret: string, authGrant: string, redirectUri: string): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
    console.log('Just set headers for the associated HTTP request. Now calling getToken().')
    console.log('authGrant:', authGrant)

    /* We use a proxied URL to avoid CORS errors. See proxy.conf.ts. */
    const body = null;
    const obs: Observable<any> = this.http.post(`${this.oAuthBaseUri}/token`, body,
      {'observe': 'response', 'headers': headers,
      'params':
        {
          'client_id' : clientId,
          'client_secret' : clientSecret,
          'grant_type' : 'authorization_code',
          'code' : authGrant,
          'redirect_uri' : redirectUri
        }
      }
    );

    const response = (await obs.toPromise()).body;
    console.log('/token response:', response);
    
    return this.handleTokenEndpointErrorsAndReturn(response);
  }

  async refreshToken(clientId: string, clientSecret: string, refreshToken: string): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    /* We use a proxied URL to avoid CORS errors. See proxy.conf.ts. */
    const body = null;
    const obs: Observable<any> = this.http.post(`/oauth-api/api/v1/token`, body,
      {'observe': 'response', 'headers': headers,
      'params':
        {
          'client_id' : clientId,
          'client_secret' : clientSecret,
          'grant_type' : 'refresh_token',
          'refresh_token': refreshToken
        }
      }
    );

    const response = (await obs.toPromise()).body;
    console.log('refreshToken() response:', response);

    return this.handleTokenEndpointErrorsAndReturn(response);
  }

  /* Helper function. */
  handleTokenEndpointErrorsAndReturn(tokenResponse) {
    if (tokenResponse.hasOwnProperty('error')) {
      const errorMessage = 'An erroneous request was made to the OAuth /token endpoint.\n' +
      `Error: ${tokenResponse.error}\nError description: ${tokenResponse.error_description}`;
      throw new Error(errorMessage);
    }
    else if (tokenResponse.hasOwnProperty('access_token')) {
      if (tokenResponse.token_type !== "Bearer")
        throw new Error(`The response object from the OAuth /token endpoint contains an "access_token", but the "token_type" is "${tokenResponse.token_type}" instead of Bearer".`);
      
      return {'accessToken': tokenResponse.access_token, 'refreshToken': tokenResponse.refresh_token};
    }
    else
      throw new Error('The response object from the OAuth /token endpoint does not contain a "access_token" or an "error".');
  }
}
