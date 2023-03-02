import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SourceDocumentsListComponent} from './components/source-documents-list/source-documents-list.component';
import {MigrationConsoleComponent} from './components/migration-console/migration-console.component';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {HTTP_INTERCEPTORS} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    SourceDocumentsListComponent,
    MigrationConsoleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {}
