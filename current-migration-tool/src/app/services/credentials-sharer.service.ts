import {Injectable, Inject} from '@angular/core';

export interface I_Credentials {
  commercialIntegrationKey: string,
  oAuthClientId: string,
  oAuthClientSecret: string,
  loginEmail: string
}

function emptyCredentials(): I_Credentials {
  return {
    commercialIntegrationKey: '',
    oAuthClientId: '',
    oAuthClientSecret: '',
    loginEmail: ''
  };
}

@Injectable({providedIn: 'root'})
export class CredentialsSharerService {
  private credentials: I_Credentials = emptyCredentials();

  constructor() {}
  
  /* TO-DO: if this works change to get and set methods*/
  setCredentials(credentials: I_Credentials) {
    (<any> window).sessionStorage.setItem('credentials', JSON.stringify(credentials));
  }

  getCredentials(): I_Credentials {
    const result = (<any> window).sessionStorage.getItem('credentials');
    return result == null ? emptyCredentials() : JSON.parse(result); // (== null) <=> (=== null or === undefined)
  }
}