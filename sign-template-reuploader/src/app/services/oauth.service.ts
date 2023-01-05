import {Injectable} from '@angular/core';
import {UrlTree, Router, UrlSerializer} from '@angular/router';

@Injectable({providedIn: 'root'})
export class OAuthService {

  private inDevelopment: boolean = true;
  private oauthBaseURL: string;

  constructor(private router: Router, private serializer: UrlSerializer) {
      if (this.inDevelopment)
        this.oauthBaseURL = 'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice'
      else
        this.oauthBaseURL = 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice';
   }

  /* Used to request an authorizaton grant. */
  getOAuthGrantRequest(clientId: string, redirectUri: string, loginEmail: string) {
    let state = this.getRandomId();
    let tree: UrlTree = this.router.createUrlTree([''],
      {
        'queryParams':
        {
              'client_id' : clientId,
              'response_type' : 'code',
              'redirect_uri' : redirectUri,
              'scope' : 'library_read library_write agreement_write', //notice no 'library_read:account'
              'state' : state,
              'login_hint' : loginEmail
        }
      });

    return {
      'url': `${this.oauthBaseURL}/api/v1/authorize` + this.serializer.serialize(tree),
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
    let tree: UrlTree = this.serializer.parse(authGrantResponse);
    
    /* Whether or not the response is erronous depends on which of "error" and "code" is a query param. */
    if (tree.queryParams.hasOwnProperty('error')) {
      let errorMessage = 'A response to a request to the OAuth /authorize endpoint is erroneous.\n' +
      `Error: ${tree.queryParams.error}\nError description: ${tree.queryParams.error_description}`;
      throw new Error(errorMessage);
    }
    else if (tree.queryParams.hasOwnProperty('code')) {
      let code: string = tree.queryParams.code;
      let state: string = tree.queryParams.state;

      // After getting the ngrx store to work, delete "false &&" in order to enable this check.
      if (false && state !== initialState) {
        throw new Error('State from server claiming to be authorization server does not match initial state passed to the authorization server.');
      }

      return code;
    }
  }

  getToken(clientSecret: string, authGrant: string, redirectUri: string): string {
    let tree: UrlTree = this.router.createUrlTree([''], {
      'queryParams': {
        'client_id' : clientId,
        'client_secret' : clientSecret,
        'grant_type' : authGrant,
        'code' : authGrant,
        'redirect_uri' : redirectUri
      }
    });
  
    let url = `${this.oauthBaseURL}/api/v1/token` + this.serializer.serialize(tree);
    // do something with this url
  
  }

  private randomIdHelper(): string { // from https://stackoverflow.com/a/55365334
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  private getRandomId(): string { // from https://stackoverflow.com/a/55365334
    return `${this.randomIdHelper()}${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}${this.randomIdHelper()}${this.randomIdHelper()}`;
  }
}
