import {Injectable} from '@angular/core';

export interface I_Credentials {
  commercialIntegrationKey: string,
  oAuthClientId: string,
  oAuthClientSecret: string,
  loginEmail: string
}

@Injectable({providedIn: 'root'})
export class CredentialsSharerService {
  private credentials: I_Credentials = {
    commercialIntegrationKey: '',
    oAuthClientId: '',
    oAuthClientSecret: '',
    loginEmail: ''
  };
  
  /* TO-DO: if this works change to get and set methods*/
  setCredentials(credentials: I_Credentials) {
    this.credentials = credentials;
  }

  getCredentials(): I_Credentials {
    return this.credentials;
  }
}
