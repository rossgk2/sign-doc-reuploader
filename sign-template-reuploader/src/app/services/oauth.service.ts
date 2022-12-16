import {Injectable} from '@angular/core';
import {UrlTree, Router, UrlSerializer} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class OAuthService {

  private inDevelopment: boolean = true;
  private oauthBaseURL: string;

  constructor(private router: Router, private serializer: UrlSerializer) {
      if (this.inDevelopment)
        this.oauthBaseURL = 'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice'
      else
        this.oauthBaseURL = 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice';

   }

  getOAuthGrantRequest(clientId: string, loginEmail: string) {
    let state = this.getRandomId();
    console.log(state);

    let tree: UrlTree = this.router.createUrlTree([''],
      {
        'queryParams':
        {
              'client_id' : clientId,
              'response_type' : 'code',
              'redirect_uri' : 'https://29f2-2600-1702-6d0-33e0-cc4e-bf6e-3ced-cb9a.ngrok.io',
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
    authGrantResponse is a URL whose query params encode the response to the request for an authorization grant.
  */
  getAuthGrantToken(authGrantResponse: string, initialState: string) {
    let tree: UrlTree = this.serializer.parse(authGrantResponse);
    
    if (tree.queryParams.hasOwnProperty('error')) {
      console.log("tree.queryParams.hasOwnProperty('error') is true");
      console.log(tree.queryParams);
    }
    else if (tree.queryParams.hasOwnProperty('code')) {
      let code = tree.queryParams.code;
      let state = tree.queryParams.state;

      console.log(`code: ${code}, state: ${state}`);

      if (state !== initialState) {
        throw new Error('State from server claiming to be authorization server does not match initial state passed to the authorization server.');
      }
    }

    
    

    
    // ?code=zHFZ3l9RpPyxIZi1enLpDtuDj6Qlv_CFDMEoW0ZQ4PM&state=c016b2ac-4756-119d-9599-3c9b1271280b
  }

  private randomIdHelper(): string { // from https://stackoverflow.com/a/55365334
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  private getRandomId(): string { // from https://stackoverflow.com/a/55365334
    return `${this.randomIdHelper()}${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}-${this.randomIdHelper()}${this.randomIdHelper()}${this.randomIdHelper()}`;
  }
}
