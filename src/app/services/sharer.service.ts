import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SharerService {
  /* TO-DO: inject window instead of using (<any> window) */
  constructor() {}
  
  set shared(shared: any) {
    (<any> window).sessionStorage.setItem('shared', JSON.stringify(shared));
  }

  get shared(): any {
    const result = (<any> window).sessionStorage.getItem('shared');
    return result == null ? null : JSON.parse(result); // (== null) <=> (=== null or === undefined)
  }
}