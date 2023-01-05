import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {reducer} from './reducer';

@NgModule({
  imports: [
    StoreModule.forRoot({
      'oAuthState': reducer,
    }),
  ],
})
export class AppStoreModule {}