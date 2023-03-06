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
  /* TO-DO: inject window instead of using (<any> window) */
  constructor() {}
  
  set credentials(credentials: I_Credentials) {
    (<any> window).sessionStorage.setItem('credentials', JSON.stringify(credentials));
  }

  get credentials(): I_Credentials {
    const result = (<any> window).sessionStorage.getItem('credentials');
    return result == null ? emptyCredentials() : JSON.parse(result); // (== null) <=> (=== null or === undefined)
  }
}