import type { CogniteClient } from '@cognite/sdk';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import { Configuration } from '@azure/msal-browser';

import type { AuthFlow, AuthResult } from '../storage/types';
import { getFlow } from '../storage';
import AzureAD from '../aad/aad';
import ADFS, { AdfsConfig } from '../adfsModule';

class CogniteAuth {
  state: {
    error: boolean;
    errorMessage?: string;
    initialized: boolean;
    initializing: boolean;
    authenticated: boolean;
    idToken?: string;
    username?: string;
    email?: string;
    project?: string;
    authResult?: AuthResult;
  } = {
    error: false,
    initialized: false,
    initializing: false,
    authenticated: false,
  };

  azureAdClient: AzureAD | undefined;

  adfsClient: ADFS | undefined;

  subscribers: {
    [appName: string]: (authState: AuthenticatedUser) => void;
  } = {};

  public initializingPromise?: Promise<void>;

  public initializingComplete?: () => void;

  public setupInitializing = (): Promise<void> => {
    this.initializingPromise = new Promise((resolve) => {
      this.initializingComplete = () => {
        this.state.initializing = false;
        resolve();
      };
    });

    return this.initializingPromise;
  };

  constructor(
    private client: CogniteClient,
    private options: {
      flow?: AuthFlow;
      cluster?: string;
      aad?: {
        appId: string;
        directoryTenantId?: string;
      };
      adfs?: {
        appId: string;
        directoryTenantId: string;
        scope: string;
      };
    } = { flow: getFlow().flow }
  ) {
    this.getClient().setBaseUrl(`https://${this.getCluster()}.cognitedata.com`);

    this.state.initializing = true;
    this.setupInitializing();
    this.initialize();
  }

  private async initialize() {
    if (this.options.aad) {
      try {
        await this.initAADAuth({
          auth: {
            authority: `https://login.microsoftonline.com/${
              this.options.aad.directoryTenantId || 'organizations'
            }`,
            clientId: this.options.aad.appId,
          },
        });
      } catch {
        // eslint-disable-next-line no-console
        console.error('Error initializing AAD Auth');
        this.state.error = true;
        this.state.initializing = false;
        this.publishAuthState();
      }
    }
    if (this.options.adfs) {
      try {
        await this.initADFSAuth({
          cluster: this.getCluster(),
          oidc: {
            authority: `https://login.microsoftonline.com/${this.options.adfs.directoryTenantId}`,
            clientId: this.options.adfs.appId,
            scope: this.options.adfs.scope,
          },
        });
      } catch {
        // eslint-disable-next-line no-console
        console.error('Error initializing ADFS Auth');
        this.state.error = true;
        this.state.initializing = false;
        this.publishAuthState();
      }
    }

    // the token will be set by one of the above auth systems
    // which will cause a page reload
    // and the second time this is rendered it will have the auth token
    // or it will get it from LS
    // then we can put it into the cognite sdk client here
    if (this.isSignedIn()) {
      this.state.authenticated = true;

      if (this.state.authResult) {
        this.state.idToken = this.state.authResult.idToken;
      }

      if (this.state.authResult?.accessToken) {
        // @ts-expect-error http is private - SDK v3
        if (this.getClient().http) {
          // @ts-expect-error http is private
          this.getClient().http.setBearerToken(
            this.state.authResult?.accessToken
          );
        }
        // @ts-expect-error httpClient is private - SDK v2
        if (this.getClient().httpClient) {
          // @ts-expect-error http is private
          this.getClient().httpClient.setBearerToken(
            this.state.authResult?.accessToken
          );
        }
      }

      this.publishAuthState();
    } else if (
      this.options.flow === 'ADFS' ||
      this.options.flow === 'AZURE_AD'
    ) {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    if (this.initializingComplete) {
      this.state.initializing = false;
      this.publishAuthState();
      this.initializingComplete();
    }
  }

  private async initAADAuth(msalConfig: Configuration) {
    this.azureAdClient = new AzureAD(msalConfig, this.getCluster());

    try {
      const account = await this.azureAdClient.loadAuthModule();

      if (!account) {
        this.state.initializing = false;
        this.publishAuthState();
        return;
      }

      const authResult = await this.azureAdClient.getProfileTokenRedirect();

      if (isObject(account)) {
        this.state.username = account.name;
        this.state.email = account.username;
      }

      if (authResult) {
        this.state.authResult = {
          authFlow: 'AZURE_AD',
          idToken: authResult.idToken,
        };
      } else {
        this.state.error = true;
      }
      const cdfAccessToken = await this.azureAdClient.getCDFToken();

      if (cdfAccessToken && authResult) {
        this.state.authResult = {
          authFlow: 'AZURE_AD',
          idToken: authResult.idToken,
          accessToken: cdfAccessToken,
        };
      }
    } catch (e) {
      this.state.error = true;
      this.state.errorMessage = 'Account setup for AAD client failed.';
      return;
    } finally {
      this.publishAuthState();
    }
  }

  private async initADFSAuth(adfsConfig: AdfsConfig) {
    this.adfsClient = new ADFS(adfsConfig);

    const authResult = this.adfsClient.processSigninResponse();

    if (authResult?.accessToken && authResult.accessToken.length !== 0) {
      this.state.authResult = authResult;
    }
  }

  public getAuthState(): AuthenticatedUser {
    return {
      authenticated: this.state.authenticated,
      project: this.state.project,
      tenant: this.state.project,
      initialising: this.state.initializing,
      token: this.state.authResult?.accessToken,
      error: this.state.error,
      email: this.state.email,
      username: this.state.username,
    };
  }

  private publishAuthState() {
    Object.keys(this.subscribers).forEach((key) =>
      this.subscribers[key](this.getAuthState())
    );
  }

  private isSignedIn() {
    if (!this.state.authResult?.idToken) {
      return false;
    }

    return this.state.authResult?.idToken.length > 0;
  }

  public getAccessToken(): string | undefined {
    return this.state.authResult && this.state.authResult.accessToken;
  }

  public getCluster(): string {
    return this.options.cluster || 'api';
  }

  public getClient(): CogniteClient {
    return this.client;
  }

  public onAuthChanged(
    key: string,
    callback: (authenticatedUser: AuthenticatedUser) => void
  ): () => void {
    this.subscribers[key] = callback;

    if (this.state.authenticated && !this.state.initializing) {
      callback(this.getAuthState());
    }

    return () => {
      delete this.subscribers[key];
    };
  }

  public async login(
    authFlow: AuthFlow,
    { cluster }: { cluster: string } = {
      cluster: '',
    }
  ): Promise<void> {
    this.options.flow = authFlow;
    if (cluster) {
      this.options.cluster = cluster;
    }
    if (authFlow === 'ADFS') {
      await this.adfsClient?.signInWithADFSRedirect();
    }
    if (authFlow === 'AZURE_AD' && this.azureAdClient) {
      this.azureAdClient.login('loginRedirect');
    }
  }

  public logout(): void {
    if (this.azureAdClient) {
      this.azureAdClient.logout();
    }
  }

  public async loginAndAuthIfNeeded(
    flow: AuthFlow,
    newTenant: string,
    cluster = ''
  ): Promise<AuthenticatedUser> {
    if (this.initializingPromise) {
      await this.initializingPromise;
    }
    if (cluster) {
      this.options.cluster = cluster;
    }
    this.options.flow = flow;

    if (!newTenant) {
      throw new Error('Supply tenant');
    }

    this.getClient().setBaseUrl(`https://${this.getCluster()}.cognitedata.com`);

    if (this.options.flow === 'COGNITE_AUTH') {
      this.state.project = newTenant;

      if (!this.state.initialized) {
        this.getClient().loginWithOAuth({
          project: newTenant,
          onTokens: async (tokens) => {
            this.state.authResult = {
              authFlow: 'COGNITE_AUTH',
              ...tokens,
            };
          },
        });
        this.state.initialized = true;
      }

      // if status === null means you are not logged in
      let status = await this.getClient().login.status();
      if (!status || status.project !== newTenant) {
        this.state.authenticated = await this.getClient().authenticate();
        if (this.state.authenticated) {
          status = await this.getClient().login.status();
          if (status) {
            this.state.project = status.project;
            this.state.email = status.user;
          }
          this.publishAuthState();
        }
      } else {
        this.state.project = status && status.project;
      }
    } else if (this.options.flow === 'ADFS') {
      if (!this.state.initialized && this.state.idToken) {
        this.getClient().loginWithOAuth({
          project: newTenant,
          accessToken: this.state.authResult?.accessToken,
          onAuthenticate: async (login) => {
            if (isFunction(login)) {
              await login('ADFS');
              login.skip();
            }
          },
        });
        const projectResponse = await this.getClient().projects.retrieve(
          newTenant
        );
        this.state.project = projectResponse.urlName;
        this.state.initialized = true;
        this.publishAuthState();
      }
    } else if (this.options.flow === 'AZURE_AD') {
      if (!this.state.initialized && this.state.idToken) {
        this.getClient().loginWithOAuth({
          project: newTenant,
          accessToken: this.state.authResult?.accessToken,
          onAuthenticate: async (login) => {
            this.state.project = newTenant;
            if (isFunction(login)) {
              await login('AZURE_AD', {
                cluster: this.getCluster(),
              });
              login.skip();
            }
          },
        });
        this.state.initialized = true;
        this.publishAuthState();
      }
    }

    return this.getAuthState();
  }
}

export default CogniteAuth;

export type AuthenticatedUser = {
  authenticated: boolean;
  initialising: boolean;
  project?: string;
  tenant?: string;
  token?: string;
  error?: boolean;
  username?: string;
  email?: string;
};
