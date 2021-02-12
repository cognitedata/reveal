import {
  PublicClientApplication,
  SilentRequest,
  AuthenticationResult,
  Configuration,
  LogLevel,
  AccountInfo,
  EndSessionRequest,
  RedirectRequest,
  PopupRequest,
} from '@azure/msal-browser';
import { getFromLocalStorage, saveToLocalStorage } from '../storage';

const PREFERRED_USER_KEY = 'cognite_prefered_ad_user';

class AzureAD {
  private myMSALObj: PublicClientApplication; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/classes/_src_app_publicclientapplication_.publicclientapplication.html

  private account!: AccountInfo; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-common/modules/_src_account_accountinfo_.html

  private loginRedirectRequest!: RedirectRequest; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_redirectrequest_.html

  private loginRequest!: PopupRequest; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_popuprequest_.html

  private silentProfileRequest!: SilentRequest; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_silentrequest_.html

  private silentCDFTokenRequest!: SilentRequest; // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_silentrequest_.html

  private userScopes = ['User.Read'];

  constructor(private msalConfig: Configuration, private cluster: string) {
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
              // eslint-disable-next-line no-console
              console.error(message);
              return;
            case LogLevel.Info:
              // eslint-disable-next-line no-console
              console.info(message);
              return;
            case LogLevel.Verbose:
              // eslint-disable-next-line no-console
              console.debug(message);
              return;
            case LogLevel.Warning:
              // eslint-disable-next-line no-console
              console.warn(message);
          }
        },
      },
    };

    this.myMSALObj = new PublicClientApplication(this.msalConfig);
    this.setCluster(cluster);
  }

  private setCluster(clusterName: string): void {
    this.cluster = clusterName;
    this.setRequestObjects();
  }

  public getCluster(): string {
    return this.cluster;
  }

  private getCDFScopes(): string[] {
    return [
      `https://${this.cluster}.cognitedata.com/user_impersonation`,
      `https://${this.cluster}.cognitedata.com/IDENTITY`,
    ];
  }

  /**
   * Initialize request objects used by this AuthModule.
   */
  private setRequestObjects(): void {
    this.loginRequest = {
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
      prompt: 'select_account',
    };

    this.loginRedirectRequest = {
      ...this.loginRequest,
      redirectStartPage: window.location.origin,
    };

    this.silentProfileRequest = {
      scopes: this.userScopes,
      // @ts-expect-error Type 'null' is not assignable to type 'AccountInfo | undefined'
      account: null,
      forceRefresh: true,
    };

    this.silentCDFTokenRequest = {
      scopes: this.getCDFScopes(),
      // @ts-expect-error Type 'null' is not assignable to type 'AccountInfo | undefined'
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
    const userId = getFromLocalStorage<string>(PREFERRED_USER_KEY);
    if (userId) {
      return this.myMSALObj.getAccountByLocalId(userId);
    }
    return null;
  }

  /**
   * Gets the token to read user profile data from MS Graph silently
   */
  async getProfileTokenRedirect(): Promise<
    void | AuthenticationResult | undefined
  > {
    this.silentProfileRequest.account = this.account;
    return this.getTokenRedirect(this.silentProfileRequest);
  }

  /**
   * Checks whether we are in the middle of a redirect and handles state accordingly. Only required for redirect flows.
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#redirect-apis
   */
  async loadAuthModule(): Promise<AccountInfo | boolean> {
    const res = await this.myMSALObj.handleRedirectPromise();
    if (res) {
      const { account } = res;
      if (account) {
        saveToLocalStorage(PREFERRED_USER_KEY, account.localAccountId);
        this.account = account;
        return this.account;
      }
      return this.account;
    }

    const account = this.getAccount();
    if (account) {
      this.account = account;
      return this.account;
    }
    return false;
  }

  /**
   * Handles the response from a popup or redirect. If response is null, will check if we have any accounts and attempt to sign in.
   * @param response
   */
  handleResponse(response: AuthenticationResult): AccountInfo | boolean {
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
        // eslint-disable-next-line no-console
        .catch((error) => console.error(error));
    } else if (signInType === 'loginRedirect') {
      this.myMSALObj.loginRedirect(this.loginRedirectRequest);
    }
  }

  /**
   * Logs out of current account.
   */
  logout(): void {
    saveToLocalStorage(PREFERRED_USER_KEY, null);
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
      return response.accessToken;
    }
    return undefined;
  }

  /**
   * Gets a token silently, or falls back to interactive redirect.
   */
  private async getTokenRedirect(
    silentRequest: SilentRequest
  ): Promise<AuthenticationResult | undefined | void> {
    try {
      const response = await this.myMSALObj.acquireTokenSilent(silentRequest);
      return response;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return undefined;
    }
  }
}

export default AzureAD;
