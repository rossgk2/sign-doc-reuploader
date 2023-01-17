import {Injectable} from '@angular/core';
import {UrlTree, Router, UrlSerializer} from '@angular/router';
import {SourceSettings} from '../settings/source-settings';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class OAuthService {

  private inDevelopment: boolean = true;
  private oauthBaseUrl: string;

  constructor(private router: Router,
              private serializer: UrlSerializer,
              private http: HttpClient)
  {
      if (this.inDevelopment)
        this.oauthBaseUrl = 'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice'
      else
        this.oauthBaseUrl = 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice';
   }

  /* Used to request an authorizaton grant.
  
    Ignoring case, env is either 'commercial' or 'fedramp'.
   */
  getOAuthGrantRequest(clientId: string, redirectUri: string, loginEmail: string, env: string) {
    const state = this.getRandomId();
    let scope: string;

    /* The syntax for the 'scope' query param depends on whether the environment is commercial or FedRamp. */
    if (env.toLowerCase() == 'commercial')
      scope = 'library_read:account library_write:account agreement_write:account';
    else if (env.toLowerCase() == 'fedramp')
      scope = 'library_read library_write agreement_write';
    else
      throw new Error("env.toLowerCase() must be either 'commercial' or 'fedramp'.");

    /* Build the URL that the user will be redirected to. */
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

    return {
      'url': `${this.oauthBaseUrl}/api/v1/authorize` + this.serializer.serialize(tree),
      'initialState': state
    };  
  }

  /*
    Inputs:
      - authGrantResponse is a URL whose query params encode the response to the request for an authorization grant.
      - initialState is the state that is sent as a part of the authorization grant request. This function needs to know
      initialState so that it can compare it to the authGrantResponse.initialState and thus verify that
      the server sending authGrantResponse is not a malicous actor pretending to be the authorizaton server.  

    Returns a unique string that is the "authorization grant". This authorizaton grant is used to
    request more tokens (access tokens, ID tokens, or refresh tokens).
  */
  getAuthGrant(authGrantResponse: string, initialState: string): string {
    const tree: UrlTree = this.serializer.parse(authGrantResponse);
    
    /* Whether or not the response is erronous depends on which of "error" and "code" is a query param. */
    if (tree.queryParams.hasOwnProperty('error')) {
      const errorMessage = 'A response to a request to the OAuth /authorize endpoint is erroneous.\n' +
      `Error: ${tree.queryParams.error}\nError description: ${tree.queryParams.error_description}`;
      throw new Error(errorMessage);
    }
    else if (tree.queryParams.hasOwnProperty('code')) {
      const code: string = tree.queryParams.code;
      const state: string = tree.queryParams.state;

      // After getting the ngrx store to work, delete "false &&" in order to enable this check.
      if (false && state !== initialState) {
        throw new Error('State from server claiming to be authorization server does not match initial state passed to the authorization server.');
      }

      return code;
    }
  }

  async getToken(clientId: string, clientSecret: string, authGrant: string, redirectUri: string): Promise<any> {
    /* Send a POST request to the /token endpoint. */
    const headers = new HttpHeaders()
       .set('Authorization', 'Bearer ' + SourceSettings.sourceIntegrationKey)
       .set('Content-Type', 'application/x-www-form-urlencoded');
    
    console.log('Just set headers for the associated HTTP request. Now calling getToken().')
    console.log('authGrant:', authGrant)

    /* We need to in null for the request body; if we don't, then the
    object with the keys 'observe', 'headers', and 'params' will be interpreted to be the request body. */
    const obs: Observable<any> = this.http.post(`${this.oauthBaseUrl}/api/v1/token`, null,
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

    const response = await obs.toPromise();
    
    /* TO-DO: handle the response body. */
    console.log('Response body from getToken():', response.body);
    return '';
  }

  private randomIdHelper(): string { // from https://stackoverflow.com/a/55365334
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  private getRandomId(): string { // from https://stackoverflow.com/a/55365334
    return `${this.randomIdHelper()}${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}${this.randomIdHelper()}${this.randomIdHelper()}`;
  }
}
