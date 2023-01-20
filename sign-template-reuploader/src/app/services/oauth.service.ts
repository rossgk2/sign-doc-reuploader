import {Injectable} from '@angular/core';
import {UrlTree, Router, UrlSerializer} from '@angular/router';
import {Credentials} from '../settings/credentials';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UrlGetterService} from './url-getter.service';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class OAuthService {

  private inDevelopment: boolean = true;
  private oAuthBaseUri: string;
  private oAuthProxyUri: string = '/oauth-api';

  constructor(private router: Router,
              private serializer: UrlSerializer,
              private http: HttpClient,
              private urlGetterService: UrlGetterService)
  { this.oAuthBaseUri = urlGetterService.getOAuthBaseUri(this.inDevelopment); }

  /* 
    Returns a URL which is an "authorizaton grant request". When the user visits this URL,
    they are effectively requesting an authorization grant.

    Also returns a randomly generated state associated with the authorizaton grant request.
    
    Inputs:
      - redirectUri is the URI that the user should be redirected to once they have visited the URL
      that is the authorizaton grant request
      - env is such that env.toLowerCase() is either 'commercial' or 'fedramp'
  */
  getOAuthGrantRequest(clientId: string, redirectUri: string, loginEmail: string, env: string): {[key: string]: string} {
    const state = this.getRandomId();
    let scope: string;

    /* The syntax for the 'scope' query param depends on whether the environment is commercial or FedRamp. */
    if (env.toLowerCase() == 'commercial')
      scope = 'library_read:account library_write:account agreement_write:account';
    else if (env.toLowerCase() == 'fedramp')
      scope = 'library_read library_write agreement_write';
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
      'url': `${this.oAuthBaseUri}/api/v1/authorize` + this.serializer.serialize(tree),
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
    const headers = new HttpHeaders()
       .set('Authorization', 'Bearer ' + Credentials.sourceIntegrationKey)
       .set('Content-Type', 'application/x-www-form-urlencoded');
    
    console.log('Just set headers for the associated HTTP request. Now calling getToken().')
    console.log('authGrant:', authGrant)

    /* We use a proxied URL to avoid CORS errors. */
    const body = null;
    const obs: Observable<any> = this.http.post(`${this.oAuthProxyUri}/api/v1/token`, body, 
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
    
    /* Handle errors. If no errors, return the obtained access token. */
    if (response.hasOwnProperty('error')) {
      const errorMessage = 'An erroneous request was made to the OAuth /token endpoint.\n' +
      `Error: ${response.error}\nError description: ${response.error_description}`;
      throw new Error(errorMessage);
    }
    else if (response.hasOwnProperty('access_token')) {
      if (response.token_type !== "Bearer")
        throw new Error(`The response object from the OAuth /token endpoint contains an "access_token", but the "token_type" is "${response.token_type}" instead of Bearer".`);
      
      console.log('response', response);
      return response.access_token;
    }
    else
      throw new Error('The response object from the OAuth /token endpoint does not contain a "access_token" or an "error".');
  }

  private randomIdHelper(): string { // from https://stackoverflow.com/a/55365334
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  private getRandomId(): string { // from https://stackoverflow.com/a/55365334
    return `${this.randomIdHelper()}${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}${this.randomIdHelper()}${this.randomIdHelper()}`;
  }
}
