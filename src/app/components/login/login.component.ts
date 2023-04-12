import { Component, OnInit } from '@angular/core';
import { OAuthService } from '../../services/oauth.service';
import { Shared, SharedInner, SharerService } from '../../services/sharer.service';
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
  _sourceComplianceLevel: string = 'commercial'; // hardcoded for now; later, use Reactive Forms to pull initial value from .html
  get sourceComplianceLevel(): 'commercial' | 'fedramp' {
    return this._sourceComplianceLevel as 'commercial' | 'fedramp';
  }

  _sourceOAuthClientId: string = '';
  get sourceOAuthClientId(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.sourceOAuthClientId;
    else
      return this._sourceOAuthClientId;
  }

  _sourceOAuthClientSecret: string = '';
  get sourceOAuthClientSecret(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.sourceOAuthClientSecret;
    else
      return this._sourceOAuthClientSecret;
  }
  
  _sourceLoginEmail: string = '';
  get sourceLoginEmail(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.sourceLoginEmail;
    else
      return this._sourceLoginEmail;
  }

  _destComplianceLevel: string = 'commercial'; // hardcoded for now; later, use use Reactive Forms to pull initial value from .html
  get destComplianceLevel(): 'commercial' | 'fedramp' {
    return this._destComplianceLevel as 'commercial' | 'fedramp';
  }

  _destOAuthClientId: string = '';
  get destOAuthClientId(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.destOAuthClientId;
    else
      return this._destOAuthClientId;
  }

  _destOAuthClientSecret: string = '';
  get destOAuthClientSecret(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.destOAuthClientSecret;
    else
      return this._destOAuthClientSecret;
  }
  
  _destLoginEmail: string = '';  
  get destLoginEmail(): string {
    if (Settings.forceUseTestCredentials)
      return Credentials.destLoginEmail;
    else
      return this._destLoginEmail;
  }

  shard: string = '';

  constructor(private oAuthService: OAuthService, private sharerService: SharerService) { }
 
  async sourceLogin() {
    this.loginHelper('source', this.sourceComplianceLevel, this.sourceOAuthClientId, this.sourceOAuthClientSecret, this.sourceLoginEmail);
  }

  async destLogin() {
    this.loginHelper('dest', this.destComplianceLevel, this.destOAuthClientId, this.destOAuthClientSecret, this.destLoginEmail);
  }

  async loginHelper(sourceOrDest: 'source' | 'dest', complianceLevel: 'commercial' | 'fedramp', oAuthClientId: string, oAuthClientSecret: string, loginEmail: string) {
    /* Get the URL, the "authorization grant request", that the user must be redirected to in order to log in.*/
    console.log('About to call getOAuthGrantRequest()');
    console.log(`complianceLevel: ${complianceLevel}, shard: ${this.shard}`);
    const authGrantRequest = this.oAuthService.getOAuthGrantRequest(sourceOrDest, complianceLevel, this.shard, oAuthClientId, Settings.redirectUri, loginEmail);
    console.log('After calling getOAuthGrantRequest()');

    /* Store the OAuth state and the credentials. */
    const temp: Shared = this.sharerService.getShared();
    temp[sourceOrDest] = {
      loggedIn: true,
      complianceLevel: complianceLevel,
      initialOAuthState: authGrantRequest.initialOAuthState,
      credentials: {
        oAuthClientId: oAuthClientId,
        oAuthClientSecret: oAuthClientSecret,
        loginEmail: loginEmail
      }
    };
    this.sharerService.setShared(temp);
  
    console.log(`source.loggedIn: ${this.sharerService.getShared().source.loggedIn}, dest.loggedIn: ${this.sharerService.getShared().dest.loggedIn}`);

    /* Redirect the user to the URL that is the authGrantRequest. */
    console.log(temp[sourceOrDest].credentials);
    console.log(authGrantRequest.url);
    await new Promise(resolve => setTimeout(resolve, 5 * 1000));
    await loadUrl(authGrantRequest.url);
  }

  async ngOnInit(): Promise<any> { }

  /* Helper function used in login.component.html. */
  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
