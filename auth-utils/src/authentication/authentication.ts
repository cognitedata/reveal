import { CogniteClient } from '@cognite/sdk';
import { AuthFlow, AuthResult, getFlow, saveFlow } from '../storage';

export type AuthenticatedUser = {
  authenticated: boolean;
  initialising: boolean;
  project?: string;
  tenant?: string;
  token?: string;
  idToken?: string;
  error?: boolean;
  errorMessage?: string;
  username?: string;
  email?: string;
};

const debugMode = false;
const log = (value: string, options?: unknown) => {
  if (debugMode) {
    // eslint-disable-next-line no-console
    if (console.log) {
      // eslint-disable-next-line no-console
      console.log(`[Auth-Utils] ${value}`, options || '');
    }
  }
};

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
    this.getClient().setBaseUrl(`https://${this.getCluster()}.cognitedata.com`);
    log('Initialized with options:', this.options);
  }

  subscribers: {
    [appName: string]: (authState: AuthenticatedUser) => void;
  } = {};

  public async loginAndAuthIfNeeded({
    flow,
    project,
  }: {
    flow?: AuthFlow;
    project: string;
  }): Promise<AuthenticatedUser> {
    const { flow: savedFlow } = getFlow();

    const authFlow = flow || savedFlow || 'COGNITE_AUTH';

    log('Running: loginAndAuthIfNeeded');
    log(`this.state ${this.state}`);
    log(`flowToUse ${authFlow}`);

    switch (authFlow) {
      case 'AZURE_AD': {
        if (!this.state.initializing && !this.state.authenticated) {
          this.state.initializing = true;
          this.publishAuthState();

          if (this.options.aad) {
            const response = await this.getClient().loginWithOAuth({
              clientId: this.options.aad?.appId,
              cluster: this.getCluster(),
              tenantId: this.options.aad?.directoryTenantId,
              signInType: {
                type: 'loginRedirect',
              },
            });

            this.getClient().setProject(project);
            if (!response) {
              await this.getClient().authenticate();
            }

            // @ts-expect-error http is private
            const fullResponse = await this.getClient().azureAdClient.msalApplication.acquireTokenSilent(
              // @ts-expect-error http is private
              this.getClient().azureAdClient.silentAccountTokenRequest
            );

            if (fullResponse.accessToken) {
              this.state.authResult = {
                idToken: fullResponse.idToken,
                accessToken: fullResponse.accessToken,
                authFlow,
                expTime: fullResponse.expiresOn,
              };
              this.state.project = project;
            }

            this.state.authenticated = response;
            this.state.initializing = false;
            this.publishAuthState();
          }
          this.state.initializing = false;
        }
        break;
      }
      case 'COGNITE_AUTH': {
        if (!this.state.initializing && !this.state.authenticated) {
          this.state.initializing = true;
          this.publishAuthState();

          this.getClient().setBaseUrl(
            `https://${this.getCluster()}.cognitedata.com`
          );
          await this.getClient().loginWithOAuth({
            project,
          });
          this.state.authenticated = await this.getClient().authenticate();
          const accessToken = await this.getClient().getCDFToken();
          if (accessToken) {
            this.state.authResult = {
              accessToken,
              authFlow,
            };
            this.state.project = project;
          }
          this.state.initializing = false;
          this.publishAuthState();
        }
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
  }) {
    this.state.initializing = false;
    this.state.error = false;
    this.state.authenticated = false;

    log(`Running: loginInitial - ${flow}`);

    // save flow before we start the login
    // so on redirect we know which one to come back to
    saveFlow(flow, {
      directory,
    });

    // allow of overrides
    // eg: legacy cluster selector screen
    if (cluster) {
      this.options.cluster = cluster;
    }

    if (flow === 'AZURE_AD') {
      if (!this.options.aad?.appId) {
        this.state.error = true;
        this.state.errorMessage = 'Missing Azure client ID.';
        return;
      }

      if (directory) {
        this.options.aad.directoryTenantId = directory;
      }

      this.client = new CogniteClient({ appId: this.options.appName });
      this.client
        .loginWithOAuth({
          clientId: this.options.aad?.appId,
          cluster: this.getCluster(),
          tenantId: directory,
          signInType: {
            type: 'loginRedirect',
            requestParams: {
              prompt: 'select_account',
            },
          },
        })
        .finally(() => {
          log('Saving flow: AZURE_AD');
          this.client.authenticate();
        });
    }
  }

  public async login(): Promise<void> {
    const { flow: authFlow, options } = getFlow();
    log('Running: login');
    this.state.initializing = true;

    if (options.cluster) {
      this.options.cluster = options.cluster;
    }

    this.client = new CogniteClient({ appId: this.options.appName });
    this.client.setBaseUrl(`https://${this.getCluster()}.cognitedata.com`);
    if (authFlow === 'COGNITE_AUTH') {
      if (options.project) {
        await this.client.loginWithOAuth({
          project: options.project,
        });
        const response = await this.client.authenticate();
        this.state.authenticated = response;
        const accessToken = await this.getClient().getCDFToken();
        if (accessToken) {
          this.state.authResult = {
            accessToken,
            authFlow,
          };
        }
      }
    }
    if (authFlow === 'ADFS') {
      // console.log('ADFS NOT READY YET');
    }
    if (authFlow === 'AZURE_AD') {
      if (this.options.aad) {
        await this.client
          .loginWithOAuth({
            clientId: this.options.aad?.appId,
            cluster: this.getCluster(),
            tenantId: this.options.aad?.directoryTenantId,
            signInType: {
              type: 'loginRedirect',
              requestParams: {
                prompt: 'none',
              },
            },
            onHandleRedirectError: (error) => {
              this.state.error = true;
              this.state.authenticated = false;
              this.state.errorMessage = error;
            },
          })
          .then(async (response) => {
            // if (!response) {
            //   await this.client.authenticate();
            // }
            this.state.error = !response;
            this.state.authenticated = response;

            // @ts-expect-error http is private
            const fullResponse = await this.getClient().azureAdClient.msalApplication.acquireTokenSilent(
              // @ts-expect-error http is private
              this.getClient().azureAdClient.silentAccountTokenRequest
            );

            if (fullResponse.accessToken) {
              this.state.authResult = {
                idToken: fullResponse.idToken,
                accessToken: fullResponse.accessToken,
                authFlow,
              };
            }
          })
          .catch((error) => {
            // console.log('Error', error);
            this.state.authenticated = false;
            this.state.error = true;
            this.state.errorMessage = error.message;
          });
      } else {
        this.state.error = true;
        this.state.errorMessage = 'Not configured properly, missing AADID';
      }
    }
    this.state.initializing = false;
    this.publishAuthState();
  }

  public logout() {
    saveFlow('UNKNOWN');
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
    };
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
