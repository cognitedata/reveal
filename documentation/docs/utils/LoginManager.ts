/*!
 * Copyright 2021 Cognite AS
 */
import { BrowserCacheLocation, Configuration, PublicClientApplication } from '@azure/msal-browser';

// login manager is merely global state, stored outside of react state,
// because react state is not preserved between mdx examples
export class LoginManager {
  private _isLoggedIn: boolean;

  private readonly _clientId = '2fb875d7-80b5-414a-9983-8f053372d760';
  private readonly _tenantId = '48d5043c-cf70-4c49-881c-c638f5796997';

  private readonly _userScopes = ['User.Read'];
  private readonly _cdfScopes = ['https://api.cognitedata.com/user_impersonation'];

  private readonly _msalInstancePromise: Promise<PublicClientApplication>;

  public get isLoggedIn() {
    return this._isLoggedIn;
  }

  constructor() {
    this._isLoggedIn = false;

    this._msalInstancePromise = this.setupMsalInstance();
  }

  public async getToken(): Promise<string> {
    const msalInstance = await this._msalInstancePromise;
    const account = msalInstance.getActiveAccount();

    if (!account) {
      throw Error("No local account found");
    }

    const { accessToken } = await msalInstance.acquireTokenSilent({
      account,
      scopes: this._cdfScopes
    });

    return accessToken;
  }

  public async loginPopup(): Promise<void> {
    const msalInstance = await this._msalInstancePromise;
    await msalInstance.loginPopup({ scopes: this._userScopes, extraScopesToConsent: this._cdfScopes });
    location.reload();
  }

  private async setupMsalInstance() {
    const msalConfig: Configuration = {
      auth: {
        clientId: this._clientId,
        authority: `https://login.microsoftonline.com/${this._tenantId}`,
        redirectUri: this.getRedirectUrl()
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: false
      }
    };

    const msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
    const allAccounts = msalInstance.getAllAccounts();

    if(allAccounts.length > 0){
      msalInstance.setActiveAccount(allAccounts[0]);
      this._isLoggedIn = true;
    }

    return msalInstance;
  }

  private getRedirectUrl(): string {
    const subdomains = window.location.pathname.split('/').filter(p => p.length > 0);
    const primarySubDomain = subdomains[0];
    if (primarySubDomain === 'reveal-docs') {
      return `${window.location.origin}/reveal-docs`;
    } else if (primarySubDomain === 'reveal-docs-preview') {
      return `${window.location.origin}/reveal-docs-preview/`;
    }
    throw new Error(`Unknown redirect URL: ${window.location.href}`);
  }
}

export const loginManager = new LoginManager();
