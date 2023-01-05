import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppStoreModule} from './store/store'
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SourceDocumentsListComponent} from './components/source-documents-list/source-documents-list.component';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    SourceDocumentsListComponent
  ],
  imports: [
    BrowserModule,
    AppStoreModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {}
