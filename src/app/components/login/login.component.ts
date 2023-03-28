import { Component, OnInit } from '@angular/core';
import { UrlSerializer } from '@angular/router';
import { OAuthService } from '../../services/oauth.service';
import { SharerService } from '../../services/sharer.service';
import { Credentials } from '../../settings/credentials';
import { Settings } from '../../settings/settings';
import { loadUrl } from '../../util/electron-functions';

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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
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
              private sharerService: SharerService,
              private serializer: UrlSerializer) { }
 
  login(): void {
    /* Get the URL, the "authorization grant request", that the user must be redirected to in order to log in.*/
    const authGrantRequest = this.oAuthService.getOAuthGrantRequest(this.oAuthClientId, Settings.redirectUri, this.loginEmail, 'FedRamp');

    /* Store the OAuth state and the credentials. */
    const temp: any = {};
    temp.initialOAuthState = authGrantRequest.initialOAuthState;
    temp.credentials = {
      commercialIntegrationKey: this.commercialIntegrationKey,
      oAuthClientId: this.oAuthClientId,
      oAuthClientSecret: this.oAuthClientSecret,
      loginEmail: this.loginEmail
    };
    this.sharerService.shared = temp;

    /* Redirect the user to the URL that is the authGrantRequest. */
    loadUrl(authGrantRequest.url);
  }

  async ngOnInit(): Promise<any> { }

  /* Helper functions for use in .html file. */

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
