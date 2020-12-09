import {
  PublicClientApplication,
  SilentRequest,
  AuthenticationResult,
  Configuration,
  LogLevel,
  AccountInfo,
  InteractionRequiredAuthError,
  EndSessionRequest,
  RedirectRequest,
  PopupRequest,
} from '@azure/msal-browser';

class AzureAD {
  private myMSALObj: PublicClientApplication; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/classes/_src_app_publicclientapplication_.publicclientapplication.html

  private account!: AccountInfo; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-common/modules/_src_account_accountinfo_.html
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-common/modules/_src_account_accountinfo_.html

  private loginRedirectRequest!: RedirectRequest; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_redirectrequest_.html
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_redirectrequest_.html

  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_redirectrequest_.html

  private loginRequest!: PopupRequest; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_popuprequest_.html
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_popuprequest_.html

  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_popuprequest_.html

  private profileRedirectRequest!: RedirectRequest;

  private profileRequest!: PopupRequest;

  private silentProfileRequest!: SilentRequest; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_silentrequest_.html
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_silentrequest_.html

  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_silentrequest_.html

  private silentCDFTokenRequest!: SilentRequest; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_silentrequest_.html
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_silentrequest_.html

  private userScopes = ['user.read'];

  constructor(private msalConfig: Configuration, private cluster?: string) {
    this.msalConfig.cache = {
      cacheLocation: 'localStorage', // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    };
    this.msalConfig.system = {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Info:
              console.info(message);
              return;
            case LogLevel.Verbose:
              console.debug(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
          }
        },
      },
    };

    this.myMSALObj = new PublicClientApplication(this.msalConfig);
    // this.account = undefined;
    this.setRequestObjects();
  }

  public setCluster(clusterName: string) {
    this.cluster = clusterName;
    this.setRequestObjects();
  }

  public getCluster() {
    return this.cluster;
  }

  private getCDFScopes(): string[] {
    return [`https://${this.cluster}.cognitedata.com/user_impersonation`];
  }

  /**
   * Initialize request objects used by this AuthModule.
   */
  private setRequestObjects(): void {
    this.loginRequest = {
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
    };

    this.loginRedirectRequest = {
      ...this.loginRequest,
      redirectStartPage: window.location.origin,
    };

    this.profileRequest = {
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
    };

    this.profileRedirectRequest = {
      ...this.profileRequest,
      redirectStartPage: window.location.href,
    };

    this.silentProfileRequest = {
      scopes: this.userScopes,
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      //@ts-ignore
      account: null,
      forceRefresh: true,
    };

    this.silentCDFTokenRequest = {
      scopes: this.getCDFScopes(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      //@ts-ignore
      account: null,
      forceRefresh: true,
    };
  }

  /**
   * Calls getAllAccounts and determines the correct account to sign into, currently defaults to first account found in cache.
   * TODO: Add account chooser code
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  getAccount(): AccountInfo | null {
    // need to call getAccount here?
    const currentAccounts = this.myMSALObj.getAllAccounts();
    console.log('[CogniteAuth] currentAccounts', currentAccounts);
    if (currentAccounts === null) {
      console.log('No accounts detected');
      return null;
    }

    if (currentAccounts.length > 1) {
      // Add choose account code here
      console.log(
        'Multiple accounts detected, need to add choose account code.',
        currentAccounts
      );
      return currentAccounts[0];
    }
    if (currentAccounts.length === 1) {
      return currentAccounts[0];
    }
    return null;
  }

  /**
   * Gets the token to read user profile data from MS Graph silently, or falls back to interactive redirect.
   */
  async getProfileTokenRedirect() {
    this.silentProfileRequest.account = this.account;
    return this.getTokenRedirect(
      this.silentProfileRequest,
      this.profileRedirectRequest
    );
  }

  /**
   * Checks whether we are in the middle of a redirect and handles state accordingly. Only required for redirect flows.
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#redirect-apis
   */
  async loadAuthModule() {
    try {
      console.log('Checking if we are on a redirect', window.location.href);
      const res = await this.myMSALObj.handleRedirectPromise();
      if (res) {
        console.log(
          'user is being redirected from azure. Selecting account',
          res
        );
        const { account } = res;
        if (account) {
          this.account = account;
          return this.account;
        }
        return this.account;
      }

      console.log('No authentication flow detected, attempt to find accounts');
      const account = this.getAccount();
      if (account) {
        console.log('Account found');
        this.account = account;
        return this.account;
      }
      console.log(
        'The user is not logged in and is not coming from a redirect'
      );
      return undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  /**
   * Handles the response from a popup or redirect. If response is null, will check if we have any accounts and attempt to sign in.
   * @param response
   */
  handleResponse(response: AuthenticationResult) {
    if (response !== null && response.account) {
      this.account = response.account;
    } else {
      const acc = this.getAccount();
      if (acc) {
        this.account = acc;
      }
    }

    if (this.account) {
      return this.account;
    }
    return false;
  }

  /**
   * Calls loginPopup or loginRedirect based on given signInType.
   * @param signInType
   */
  login(signInType: 'loginPopup' | 'loginRedirect'): void {
    if (signInType === 'loginPopup') {
      this.myMSALObj
        .loginPopup(this.loginRequest)
        .then((resp: AuthenticationResult) => {
          this.handleResponse(resp);
        })
        .catch(console.error);
    } else if (signInType === 'loginRedirect') {
      this.myMSALObj.loginRedirect(this.loginRedirectRequest);
    }
  }

  /**
   * Logs out of current account.
   */
  logout(): void {
    const logOutRequest: EndSessionRequest = {
      account: this.account || undefined,
    };

    this.myMSALObj.logout(logOutRequest);
  }

  async getCDFToken(): Promise<string | undefined> {
    if (this.account) {
      this.silentCDFTokenRequest.account = this.account;
      const response: AuthenticationResult = await this.myMSALObj.acquireTokenSilent(
        this.silentCDFTokenRequest
      );
      console.log('CDF-token request');
      return response.accessToken;
    }
    return undefined;
  }

  /**
   * Gets a token silently, or falls back to interactive redirect.
   */
  private async getTokenRedirect(
    silentRequest: SilentRequest,
    interactiveRequest: RedirectRequest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<AuthenticationResult | undefined | void> {
    try {
      const response = await this.myMSALObj.acquireTokenSilent(silentRequest);
      console.log('getTokenRedirect', response);
      return response;
    } catch (e) {
      console.log('silent token acquisition fails.');
      if (e instanceof InteractionRequiredAuthError) {
        console.log('acquiring token using redirect');
        return this.myMSALObj
          .acquireTokenRedirect(interactiveRequest)
          .catch(() => undefined);
      }
      console.error(e);
      return undefined;
    }
  }
}

export default AzureAD;
