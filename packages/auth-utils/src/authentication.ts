import isString from 'lodash/isString';
import { CogniteClient } from '@cognite/sdk-v5';

import { getFakeIdPInfoFromStorage, doFakeIdPLogin } from './fakeIdP';
import { AuthenticatedUser, AuthFlow, AuthResult, TokenInspect } from './types';
import { getFlow, saveFlow, log, decodeTokenUid } from './utils';

export class CogniteAuth {
  state: {
    error: boolean;
    errorMessage?: string;
    initializing: boolean;
    authenticated: boolean;
    idToken?: string;
    username?: string;
    email?: string;
    project?: string;
    authResult?: AuthResult;
    id?: string;
  } = {
    error: false,
    initializing: false,
    authenticated: false,
  };

  constructor(
    private client: CogniteClient,
    private options: {
      flow?: AuthFlow;
      cluster?: string;
      appName: string;
      aad?: {
        appId: string;
        directoryTenantId?: string;
      };
      adfs?: {
        appId: string;
        directoryTenantId: string;
        scope: string;
      };
    } = { flow: getFlow().flow, appName: 'unknown' }
  ) {
    this.setCluster(options.cluster);
    log('Initialized with options:', this.options);
  }

  private setCluster(cluster?: string) {
    if (cluster) {
      this.options.cluster = cluster;
    }
    this.getClient().setBaseUrl(`https://${this.getCluster()}.cognitedata.com`);
  }

  private makeNewCDFClient() {
    this.client = new CogniteClient({ appId: this.options.appName });
    this.setCluster();

    return this.client;
  }

  subscribers: {
    [appName: string]: (authState: AuthenticatedUser) => void;
  } = {};

  public async loginAndAuthIfNeeded({
    flow,
    project,
    reauth,
  }: {
    project: string;
    flow?: AuthFlow;
    reauth?: boolean;
  }): Promise<AuthenticatedUser> {
    const { flow: savedFlow } = getFlow();

    const authFlow = flow || savedFlow || 'COGNITE_AUTH';

    log('Running: loginAndAuthIfNeeded');
    log('Internal state', this.state);
    log(`FlowToUse: ${authFlow}`);

    if (this.state.initializing || this.state.authenticated) {
      return this.getAuthState();
    }

    switch (authFlow) {
      case 'AZURE_AD': {
        this.state.initializing = true;
        this.publishAuthState();

        if (this.options.aad) {
          const client = reauth ? this.makeNewCDFClient() : this.getClient();

          const response = await client.loginWithOAuth({
            type: 'AAD_OAUTH',
            options: {
              clientId: this.options.aad?.appId,
              cluster: this.getCluster(),
              tenantId: this.options.aad?.directoryTenantId,
              signInType: {
                type: 'loginRedirect',
              },
            },
          });

          this.getClient().setProject(project);
          if (!response) {
            await this.getClient().authenticate();
          }
          const CDFToken = await this.getCDFToken();
          const { accessToken, idToken, expiresOn, account } = CDFToken;

          if (accessToken) {
            this.state.authResult = {
              idToken,
              accessToken,
              authFlow,
              expTime: expiresOn,
            };
            this.state.id = decodeTokenUid(accessToken);

            const email = account?.username.includes('@')
              ? account.username
              : undefined;
            this.state.email = email;
            this.state.project = project;
          }

          this.state.authenticated = response;
          this.state.initializing = false;
          this.publishAuthState();
        }
        this.state.initializing = false;
        break;
      }
      case 'COGNITE_AUTH': {
        this.state.initializing = true;
        this.publishAuthState();

        this.setCluster();
        await this.getClient().loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
          },
        });
        this.state.authenticated = await this.getClient().authenticate();
        const accessToken = await this.getClient().getCDFToken();
        const status = await this.getClient().login.status();

        if (status) {
          this.state.email = status.user;
        }

        if (accessToken) {
          this.state.authResult = {
            accessToken,
            authFlow,
          };
          this.state.id = decodeTokenUid(accessToken);
          this.state.project = project;
        }
        this.state.initializing = false;
        this.publishAuthState();
        break;
      }
      case 'FAKE_IDP': {
        const settings = getFakeIdPInfoFromStorage();
        if (settings) {
          await doFakeIdPLogin({
            ...settings,
            customExpiry: undefined,
          });
        }

        this.setFakeIdPInfo();
        this.publishAuthState();
        break;
      }
      default: {
        window.location.href = '/';
      }
    }

    return this.getAuthState();
  }

  public async loginInitial({
    flow,
    cluster,
    directory,
  }: {
    flow: AuthFlow;
    cluster?: string;
    directory?: string;
  }): Promise<void> {
    this.state.initializing = false;
    this.resetError();
    this.invalidateAuth();

    log(`Running: loginInitial - ${flow}`);

    // save flow before we start the login
    // so on redirect we know which one to come back to
    log('Saving flow: AZURE_AD');
    saveFlow(flow, {
      directory,
    });

    // allow of overrides
    // eg: legacy cluster selector screen
    if (cluster) {
      this.options.cluster = cluster;
    }
    if (flow === 'FAKE_IDP') {
      this.setFakeIdPInfo();
    }
    if (flow === 'AZURE_AD') {
      if (!this.options.aad?.appId) {
        this.setError('Missing Azure client ID.');
        return;
      }

      if (directory) {
        this.options.aad.directoryTenantId = directory;
      }

      this.makeNewCDFClient();

      this.client
        .loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId: this.options.aad?.appId,
            cluster: this.getCluster(),
            tenantId: directory,
            signInType: {
              type: 'loginRedirect',
              requestParams: {
                prompt: 'select_account',
              },
            },
          },
        })
        .then(() => {
          return this.client.authenticate();
        })
        .then((response) => {
          this.state.authenticated = response;

          if (!this.state.authenticated) {
            throw new Error('Invalid CDF token.');
          }

          return this.getCDFToken();
        })
        .then((token) => {
          const { accessToken, idToken } = token;

          if (accessToken) {
            this.state.authResult = {
              idToken,
              accessToken,
              authFlow: 'AZURE_AD',
            };
            this.state.id = decodeTokenUid(accessToken);
          } else {
            throw new Error('No token found');
          }
        })
        .catch((error) => {
          this.setError(error);
        })
        .finally(() => {
          log('Finished flow: AZURE_AD');
          this.publishAuthState();
        });
    }
  }

  public async login(): Promise<void> {
    const { flow: authFlow, options } = getFlow();
    log('Running: login');
    this.state.initializing = true;

    if (options?.cluster) {
      this.options.cluster = options.cluster;
    }

    this.makeNewCDFClient();

    if (authFlow === 'COGNITE_AUTH') {
      if (options?.project) {
        await this.getClient().loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project: options.project,
          },
        });
        const response = await this.getClient().authenticate();
        this.state.authenticated = response;
        const accessToken = await this.getClient().getCDFToken();

        if (accessToken) {
          this.state.authResult = {
            accessToken,
            authFlow,
          };
          this.state.id = decodeTokenUid(accessToken);
        }
      }
    }
    if (authFlow === 'ADFS') {
      // console.log('ADFS NOT READY YET');
    }
    if (authFlow === 'FAKE_IDP') {
      this.setFakeIdPInfo();
    }
    if (authFlow === 'AZURE_AD') {
      if (this.options.aad) {
        await this.client
          .loginWithOAuth({
            type: 'AAD_OAUTH',
            options: {
              clientId: this.options.aad?.appId,
              cluster: this.getCluster(),
              tenantId: this.options.aad?.directoryTenantId,
              signInType: {
                type: 'loginRedirect',
                requestParams: {
                  prompt: 'none',
                },
              },
              onNoProjectAvailable: () => {
                this.invalidateAuth();
                this.setError('Invalid access token!');
              },
            },
          })
          .then(async (response) => {
            this.state.error = !response;
            this.state.authenticated = response;

            const { accessToken, idToken } = await this.getCDFToken();

            if (accessToken) {
              this.state.authResult = {
                idToken,
                accessToken,
                authFlow,
              };
              this.state.id = decodeTokenUid(accessToken);
            }
          })
          .catch((error) => {
            // console.log('Error', error);
            this.invalidateAuth();
            this.setError(error.message);
          });
      } else {
        this.setError('Not configured properly, missing AADID');
      }
    }
    this.state.initializing = false;
    this.publishAuthState();
  }

  // useful for when non CDF  services need to trigger a reauth flow
  invalidateAuth() {
    this.state.authenticated = false;
  }

  // the SDK did not provide a way to get the ID token
  // so as a temp fix, we need to get this manually
  private getCDFToken() {
    // @ts-expect-error azureAdClient is private
    return this.getClient().azureAdClient.msalApplication.acquireTokenSilent(
      // @ts-expect-error azureAdClient is private
      this.getClient().azureAdClient.silentCDFTokenRequest
    );
  }

  private setFakeIdPInfo() {
    const fakeAuth = getFakeIdPInfoFromStorage();
    if (fakeAuth) {
      this.setCluster(fakeAuth.cluster);
      // always make a new client, so we can keep state clean
      this.makeNewCDFClient();

      this.getClient().loginWithOAuth({
        type: 'CDF_OAUTH',
        options: {
          project: fakeAuth.project,
          accessToken: fakeAuth.accessToken,
          onAuthenticate: (login) => {
            login.skip();
          },
        },
      });

      this.state.project = fakeAuth.project;
      this.state.authenticated = true;
      this.state.initializing = false;

      this.state.authResult = {
        idToken: fakeAuth.idToken,
        accessToken: fakeAuth.accessToken,
        authFlow: 'FAKE_IDP',
      };
      this.state.id = decodeTokenUid(fakeAuth.accessToken);
      this.state.email = this.state.id;
    }
  }

  public logout(): void {
    saveFlow('UNKNOWN');
    // reset auth and cdf client too
    this.makeNewCDFClient();
    this.options.flow = 'UNKNOWN';
    // -@TODO: add better logout process
    // we should delete some localstorage stuff perhaps?
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

  public async getProjects(): Promise<TokenInspect['projects']> {
    try {
      this.resetError();

      const response = await this.getClient().get('/api/v1/token/inspect');

      const { projects } = response.data as TokenInspect;

      return projects;
    } catch (err) {
      this.setError('Error fetching projects');
      throw err;
    }
  }

  public getAuthState(): AuthenticatedUser {
    return {
      authenticated: this.state.authenticated,
      project: this.state.project,
      tenant: this.state.project,
      initialising: this.state.initializing,
      token: this.state.authResult?.accessToken,
      idToken: this.state.authResult?.idToken,
      error: this.state.error,
      errorMessage: this.state.errorMessage,
      email: this.state.email,
      username: this.state.username,
      id: this.state.id,
    };
  }

  private setError(message: string | Error) {
    this.state.error = true;
    if (isString(message)) {
      this.state.errorMessage = message;
    } else {
      this.state.errorMessage = message.message;
    }
  }

  private resetError() {
    this.state.error = false;
    this.state.errorMessage = '';
  }

  private publishAuthState() {
    Object.keys(this.subscribers).forEach((key) =>
      this.subscribers[key](this.getAuthState())
    );
  }

  public getCluster(): string {
    return this.options.cluster || 'api';
  }

  public getClient(): CogniteClient {
    return this.client;
  }
}

export default CogniteAuth;
