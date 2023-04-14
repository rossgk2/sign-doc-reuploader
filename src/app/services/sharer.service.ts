import { Injectable } from '@angular/core';

/* The type of the object to be shared. */
export class SharedInner {
  loggedIn = false;
  complianceLevel: 'commercial' | 'fedramp' = 'commercial';
  initialOAuthState = '';
  credentials = {
    oAuthClientId: '',
    oAuthClientSecret: '',
    loginEmail: ''
  }
};

export class Shared {
  source: SharedInner = new SharedInner();
  dest: SharedInner = new SharedInner();
};

/* Service with getter and setter methods for sharing an object of type "Shared". */
@Injectable({providedIn: 'root'})
export class SharerService {
  /* If this constructor is being called for the first time, generate a default value for "shared". Otherwise,
  restore the value from the session storage by using the getShared() method. */
  private shared: Shared | null = null;

  /* If this constructor is being called for the first time, generate a default value for "shared". Otherwise,
  restore the value from the session storage by using the getShared() method. */
  constructor() {
    this.shared = this.shared == null ? new Shared() : this.getShared();
    this.shared = this.shared == null ? new Shared() : this.getShared();
  }
  
  /* It's tempting to use the syntatic sugar of getter and setter methods ("get shared()" and "set shared(shared: Shared)"),
  but this leads to the easy mistake of writing something such as "sharerService.shared.source = temp" and expecting it to work.
  Implementing a setter method for a non-primitive field actually does *not* cause the expected syntatic sugar
  for the non-primitive field's fields to be valid. */

  setShared(shared: Shared) {
    (<any> window).sessionStorage.setItem('shared', JSON.stringify(shared));
  }

  getShared(): Shared {
    const result = (<any> window).sessionStorage.getItem('shared');
    return result == null ? null : JSON.parse(result); // (== null) <=> (=== null or === undefined)
  }
}