import { Component, OnInit } from '@angular/core';
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

*/

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  /* Fields input by user. */
  _sourceComplianceLevel: string = 'commercial';
  _sourceOAuthClientId: string = '';
  _sourceOAuthClientSecret: string = '';
  _sourceLoginEmail: string = '';
  _destComplianceLevel: string = 'commercial';
  _destOAuthClientId: string = '';
  _destOAuthClientSecret: string = '';
  _destLoginEmail: string = '';  

  get sourceComplianceLevel(): string {
    return this._sourceComplianceLevel;
  }

  get sourceOAuthClientId(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.sourceOAuthClientId;
    else
      return this._sourceOAuthClientId;
  }

  get sourceOAuthClientSecret(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.sourceOAuthClientSecret;
    else
      return this._sourceOAuthClientSecret;
  }
  
  get sourceLoginEmail(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.sourceLoginEmail;
    else
      return this._sourceLoginEmail;
  }

  get destComplianceLevel(): string {
    return this._destComplianceLevel;
  }

  get destOAuthClientId(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.destOAuthClientId;
    else
      return this._destOAuthClientId;
  }

  get destOAuthClientSecret(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.destOAuthClientSecret;
    else
      return this._destOAuthClientSecret;
  }
  
  get destLoginEmail(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.destLoginEmail;
    else
      return this._destLoginEmail;
  } 

  constructor(private oAuthService: OAuthService,
              private sharerService: SharerService) { }
 
  
  async sourceLogin() {
    this.loginHelper('source', this.sourceComplianceLevel, this.sourceOAuthClientId, this.sourceOAuthClientSecret, this.sourceLoginEmail);
  }

  async destLogin() {
    this.loginHelper('dest', this.destComplianceLevel, this.destOAuthClientId, this.destOAuthClientSecret, this.destLoginEmail);
  }

  loginHelper(sourceOrDest: 'source' | 'dest', complianceLevel: string, oAuthClientId: string, oAuthClientSecret: string, loginEmail: string): void {
    /* Get the URL, the "authorization grant request", that the user must be redirected to in order to log in.*/
    console.log('About to call getOAuthGrantRequest()');
    const authGrantRequest = this.oAuthService.getOAuthGrantRequest(complianceLevel, oAuthClientId, Settings.redirectUri, loginEmail);
    console.log('After calling getOAuthGrantRequest()');

    /* Store the OAuth state and the credentials. */
    const temp: any = {};
    temp.complianceLevel = complianceLevel;
    temp.initialOAuthState = authGrantRequest.initialOAuthState;
    temp.credentials = {
      oAuthClientId: oAuthClientId,
      oAuthClientSecret: oAuthClientSecret,
      loginEmail: loginEmail
    };
    this.sharerService.shared = {};
    this.sharerService.shared[sourceOrDest] = temp;

    /* Redirect the user to the URL that is the authGrantRequest. */
    loadUrl(authGrantRequest.url);
  }

  async ngOnInit(): Promise<any> { }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
