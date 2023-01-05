import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SourceDocumentsListComponent} from './components/source-documents-list/source-documents-list.component';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {StoreModule} from '@ngrx/store';
import {reducer} from './store/reducer';

@NgModule({
  declarations: [
    AppComponent,
    SourceDocumentsListComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({'oAuthState': reducer}),
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
