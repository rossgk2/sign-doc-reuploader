import { Injectable } from '@angular/core';

/* The type of the object to be shared. */
export class SharedInner {
  complianceLevel: 'commercial' | 'fedramp' = 'commercial';
  initialOAuthState = '';
  credentials = {
    oAuthClientId: '',
    oAuthClientSecret: '',
    loginEmail: ''
  }
};

export class Shared {
  source = new SharedInner();
  dest = new SharedInner();
  sourceLoggedIn = false;
  destLoggedIn = false;
};

/* Service with getter and setter methods for sharing an object of type "Shared". */
@Injectable({providedIn: 'root'})
export class SharerService {
  /* TO-DO: inject window instead of using (<any> window) */
  constructor() {
    this.shared = new Shared();
  }
  
  set shared(shared: Shared) {
    (<any> window).sessionStorage.setItem('shared', JSON.stringify(shared));
  }

  get shared(): Shared {
    const result = (<any> window).sessionStorage.getItem('shared');
    return result == null ? null : JSON.parse(result); // (== null) <=> (=== null or === undefined)
  }
}