/* Regular Angular stuff */
import {Component, OnInit, HostListener} from '@angular/core';
import {UrlTree, UrlSerializer} from '@angular/router';

/* Services */
import {OAuthService, I_OAuthGrantRequest} from '../../services/oauth.service';
import {CredentialsSharerService, I_Credentials} from '../../services/credentials-sharer.service';

/* Utilities */
import {httpRequest, loadUrl, getCurrentUrl} from '../../util/electron-functions';

/* User-defined configuration */
import {Credentials} from '../../settings/credentials';

/* Settings */
import {Settings} from '../../settings/settings';

/* For debug purposes. */
import {saveAs} from 'file-saver';

/*
  ===================================================================
  Helpful wiki articles
  ===================================================================

  OAuth for commercial:
  https://secure.na1.adobesign.com/public/static/oauthDoc.jsp

  OAuth for FedRamp:
  https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=~kmashint&title=Adobe+Acrobat+Sign+and+US+Gov+Cloud+-+FedRAMP+Moderate#AdobeAcrobatSignandUSGovCloudFedRAMPModerate-Authorize

  Commercial vs. FedRamp:
  https://wiki.corp.adobe.com/display/ES/API+Application+Commercial+vs+Gov+Cloud
  
  ===================================================================

  We are currently implementing OAuth for FedRamp. After we do that it'd probably be a good idea to add the implementation
  for commercial.
*/

@Component({
  selector: 'app-source-documents-list',
  templateUrl: './source-documents-list.component.html',
  styleUrls: ['./source-documents-list.component.scss']
})
export class SourceDocumentsListComponent implements OnInit {
  
  /* Internal variables. */
  private static previousUrl: string = window.location.href; // the URL that hosts this webapp before user is redirected

  /* Fields input by user. */
  _commercialIntegrationKey: string = '';
  _oAuthClientId: string = '';
  _oAuthClientSecret: string = '';
  _loginEmail: string = '';

  get commercialIntegrationKey() {
    if (Settings.forceUseTestCredentials)
      return Credentials.commercialIntegrationKey;
    else
      return this._commercialIntegrationKey;
  }

  get oAuthClientId() {
    if (Settings.forceUseTestCredentials)
      return Credentials.oAuthClientId;
    else
      return this._oAuthClientId;
  }

  get oAuthClientSecret() {
    if (Settings.forceUseTestCredentials)
      return Credentials.oAuthClientSecret;
    else
      return this._oAuthClientSecret;
  }
  
  get loginEmail() {
    if (Settings.forceUseTestCredentials)
      return Credentials.loginEmail;
    else
      return this._loginEmail;
  } 

  constructor(private oAuthService: OAuthService,
              private credentialsSharerService: CredentialsSharerService,
              private serializer: UrlSerializer) { }
 
  login(): void {
    console.log("login clicked.")

    if (!false) { // TO-DO: change false to redirectedElectron()
      /* Get the URL, the "authorization grant request", that the user must be redirected to in order to log in.*/
      const authGrantRequest = this.oAuthService.getOAuthGrantRequest(this.oAuthClientId, Settings.redirectUri, this.loginEmail, 'FedRamp');
      // TO-DO: store authGrantRequest.state with the ngrx store
      console.log(`Authorization grant request URL: ${authGrantRequest.url}`);

      /* Store the credentials obtained. */
      this.credentialsSharerService.setCredentials({
        commercialIntegrationKey: this.commercialIntegrationKey,
        oAuthClientId: this.oAuthClientId,
        oAuthClientSecret: this.oAuthClientSecret,
        loginEmail: this.loginEmail
      });

      /* Redirect the user to the URL that is the authGrantRequest. */
      loadUrl(authGrantRequest.url);
    }
  }

  async ngOnInit(): Promise<any> {
    console.log("ngOnInit() called.");

    /* Tests of functions from electron-functions.ts. */
    const requestConfig = {
      method: "get",
      url: `https://pokeapi.co/api/v2/pokemon/treecko`,
    };
    const testResponse = await httpRequest(requestConfig);
    console.log(testResponse);

    console.log('getCurrentUrl()', await getCurrentUrl());
  }

  /* Helper functions for use in .html file. */

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
