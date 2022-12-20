import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private _store: { [key: string]: any; } = {};

  constructor() { }

  get store(): any {
    return this._store;
  }

  set store(value: any) {
    this._store = value;
  }
}
