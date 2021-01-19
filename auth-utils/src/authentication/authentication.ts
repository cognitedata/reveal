import type { CogniteClient } from '@cognite/sdk';
import axios from 'axios';
import isFunction from 'lodash/isFunction';
import { Configuration } from '@azure/msal-browser';

import {
  clearByNoProject,
  clearByProject,
  isAuthFlow,
  isNoAuthFlow,
  retrieveAuthResult,
  saveAuthResult,
} from '../storage';
import type { AuthFlow, AuthResult } from '../storage';
import AzureAD from '../aad/aad';
import {
  getUserInfo,
  processSigninResponse,
  signInWithADFSRedirect,
  userInfoMapper,
} from '../adfsModule';

const log = (message: string, data: unknown = '') => {
  const ENV = process.env.REACT_APP_ENV || process.env.NODE_ENV;

  const isEnvironment = (environement: string) => ENV === environement;

  if (isEnvironment('development')) {
    // eslint-disable-next-line no-console
    console.log('[CogniteAuth]', message, data);
  }
};

class CogniteAuth {
  state: {
    error: boolean;
    errorMessage?: string;
    initialized: boolean;
    initializing: boolean;
    authenticated: boolean;
    availableProjects?: { urlName: string; cluster: string }[];
    accessToken?: string;
    idToken?: string;
    projectId?: number;
    username?: string;
    project?: string;
    authResult?: AuthResult;
  } = {
    error: false,
    initialized: false,
    initializing: true,
    authenticated: false,
  };

  azureAdClient: AzureAD | null = null;

  subscribers: {
    [appName: string]: (authState: AuthenticatedUser) => void;
  } = {};

  private cluster = '';

  private msalConfig?: Configuration;

  public initializingPromise?: Promise<void>;

  public initializingComplete?: () => void;

  public startInitializing = (): Promise<void> => {
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
      cluster: string;
      msalConfig?: Configuration;
    }
  ) {
    this.cluster = this.options.cluster;
    this.msalConfig = this.options.msalConfig;

    this.startInitializing();

    // if we just want Cognite Auth
    // then msalConfig will not exist
    if (this.msalConfig) {
      this.init(this.msalConfig);
    }
  }

  private async init(msalConfig: Configuration) {
    log('Init', { cluster: this.getCluster() });
    await this.initAuth(msalConfig);
    if (this.isSignedIn()) {
      log('is signed in');
      this.state.accessToken =
        this.state.authResult && this.state.authResult.accessToken;
      const projects = await this.listProjects();
      this.state.availableProjects = projects;
      this.state.authenticated = true;
      this.state.projectId = -1;
      if (this.state.authResult) {
        this.state.idToken = this.state.authResult.idToken;
      }
      this.state.username = userInfoMapper(
        getUserInfo(this.state.idToken)
      ).username;
      log('Available Projects:', this.state.availableProjects);
      if (
        this.state.availableProjects &&
        this.state.availableProjects.length === 1
      ) {
        const selectedProject = this.state.availableProjects[0];
        log(`Auto selecting only project: ${selectedProject}`);
        this.state.project = selectedProject && selectedProject.urlName;
        if (this.state.project) {
          log('Saving the authresult');
          const authRes = retrieveAuthResult();
          if (authRes && authRes.authFlow) {
            saveAuthResult(
              {
                authFlow: authRes.authFlow,
                accessToken: this.state.accessToken,
                idToken: this.state.idToken,
                expTime: 0,
              },
              this.state.project
            );
            clearByNoProject();
          }

          // this is a fusion only thing i think:
          if (window.location.pathname === '/') {
            // redirect only if we are on the root path
            window.location.href = `/${
              selectedProject.urlName
            }?env=${this.getCluster()}`;
          }
        }
      }
      this.publishAuthState();
    } else if (
      isAuthFlow('ADFS') ||
      isAuthFlow('AZURE_AD_MULTI_TENANCY') ||
      isNoAuthFlow()
    ) {
      if (window.location.pathname !== '/') {
        log('not signed in redirecting back to login page');
        // eslint-disable-next-line no-unused-expressions
        window.location.href = '/';
      }
      log('Not signed in, but on already on login page');
    } else {
      // Notes:
      // this does not seem to check for an existing token in storage on load
      // i am not sure why we don't do this here
      //
      log('is not signed in');
    }

    if (this.initializingComplete) {
      this.initializingComplete();
    }
  }

  private async initAuth(msalConfig: Configuration) {
    const authCache = retrieveAuthResult();
    if (authCache && isAuthFlow('ADFS')) {
      log('Initialise ADFS');
      const authResult = processSigninResponse();
      this.cluster = 'sandfield';
      if (
        authResult &&
        authResult.accessToken &&
        authResult.accessToken.length !== 0
      ) {
        this.state.authResult = authResult;
      }
    } else if (authCache && isAuthFlow('AZURE_AD_MULTI_TENANCY')) {
      log('Initialise AZURE_AD_MULTI_TENANCY', this.cluster);
      this.azureAdClient = new AzureAD(msalConfig, this.cluster);
      log('Client setup');
      const account = await this.azureAdClient.loadAuthModule();
      log('Account:', account);
      if (!account) {
        this.state.error = true;
        return;
      }
      const authResult = await this.azureAdClient.getProfileTokenRedirect();
      log('First authResult is back:', authResult);
      const cdfAccessToken = await this.azureAdClient.getCDFToken();
      if (authResult) {
        this.state.authResult = {
          authFlow: 'AZURE_AD_MULTI_TENANCY',
          accessToken: cdfAccessToken,
          idToken: authResult.idToken,
        };
      }
    }
  }

  public getAuthState(): AuthenticatedUser {
    const authRes = retrieveAuthResult();
    return {
      authenticated: this.state.authenticated,
      project: this.state.project,
      projectId: this.state.projectId,
      tenant: this.state.project,
      initialising: this.state.initializing,
      username: this.state.username,
      token: authRes?.accessToken,
      availableProjects: this.state.availableProjects,
    };
  }

  public selectProject(project: string): void {
    if (this.state.authResult) {
      saveAuthResult(this.state.authResult, project);
      clearByNoProject();
    }
  }

  private publishAuthState() {
    log('publishing authState', this.subscribers);
    Object.keys(this.subscribers).forEach((key) =>
      this.subscribers[key](this.getAuthState())
    );
  }

  private isSignedIn() {
    return (
      this.state.authResult &&
      this.state.authResult.idToken &&
      this.state.authResult.idToken.length > 0
    );
  }

  public getAccessToken(): string | undefined {
    return this.state.authResult && this.state.authResult.accessToken;
  }

  public getCluster(): string {
    return this.cluster || 'api';
  }

  // this is called before we have selected a project to use
  // that is why we are NOT using the cognite SDK client for this request(?)
  private async listProjects(): Promise<
    { urlName: string; cluster: string }[]
  > {
    try {
      // --@todo: change this to use fetch.
      const res = await axios.get<{ items: { urlName: string }[] }>(
        `https://${this.getCluster()}.cognitedata.com/api/v1/projects`,
        {
          headers: { Authorization: `Bearer ${this.getAccessToken()}` },
        }
      );
      return res.data.items.map((item) => ({
        ...item,
        cluster: this.getCluster(),
      }));
    } catch (e) {
      return [];
    }
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
    { project, cluster }: { project?: string; cluster: string } = {
      project: '',
      cluster: '',
    }
  ): Promise<void> {
    saveAuthResult({ authFlow }, project);
    if (authFlow === 'ADFS') {
      this.cluster = 'sandfield';
      log('Starting ADFS for cluster:', this.getCluster());
      await signInWithADFSRedirect();
    }
    if (authFlow === 'AZURE_AD_MULTI_TENANCY') {
      if (cluster) {
        this.cluster = cluster;
      }
      if (this.msalConfig) {
        log(
          'Starting AzureAD AZURE_AD_MULTI_TENANCY for cluster:',
          this.getCluster()
        );
        new AzureAD(this.msalConfig, this.getCluster()).login('loginRedirect');
      }
    }

    if (authFlow === 'COGNITE_AUTH') {
      log('No special login except storing the given authFlow');
    }
  }

  public logout(): void {
    const { project } = this.state;
    if (project) {
      clearByProject(project);
    }
    window.location.href = '/';
  }

  public async loginAndAuthIfNeeded(
    newTenant: string,
    cluster = ''
  ): Promise<AuthenticatedUser> {
    if (cluster) {
      this.cluster = cluster;
    }

    log('loginAndAuthIfNeeded');
    if (!newTenant) {
      throw new Error('Supply tenant');
    }
    if (this.state.project && newTenant !== this.state.project) {
      // eslint-disable-next-line no-console
      console.warn(
        'You are changing the tenant, this might have unseen consequences!'
      );
    }

    this.getClient().setBaseUrl(`https://${this.getCluster()}.cognitedata.com`);

    if (isAuthFlow('COGNITE_AUTH')) {
      log('authflow COGNITE_AUTH');
      this.state.project = newTenant;
      this.state.username = undefined;

      if (!this.state.initialized) {
        this.getClient().loginWithOAuth({
          project: newTenant,
          onTokens: (tokens) => {
            log('COGNITE_AUTH tokens', tokens);
            saveAuthResult(
              {
                authFlow: 'COGNITE_AUTH',
                accessToken: tokens.accessToken,
                idToken: tokens.idToken,
                expTime: 0,
              },
              this.state.project
            );
          },
        });
        this.state.initialized = true;
      }

      let status = await this.getClient().login.status();
      if (!status || status.project !== newTenant) {
        this.state.authenticated = await this.getClient().authenticate();
        if (this.state.authenticated) {
          status = await this.getClient().login.status();
          if (status) {
            this.state.username = status.user;
            this.state.project = status.project;
            this.state.projectId = status.projectId;
          }
          this.publishAuthState();
        }
      } else {
        this.state.username = status && status.user;
        this.state.project = status && status.project;
        this.state.projectId = status && status.projectId;
      }
    } else if (isAuthFlow('ADFS')) {
      log('authflow ADFS');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.getClient().http.setBearerToken(this.state.accessToken);

      if (!this.state.initialized && this.state.idToken) {
        this.getClient().loginWithOAuth({
          project: newTenant,
          accessToken: this.state.accessToken,
          onAuthenticate: async (login) => {
            if (isFunction(login)) {
              await login('ADFS');
              login.skip();
            }
          },
        });
        this.state.initialized = true;
        const projectResponse = await this.getClient().projects.retrieve(
          newTenant
        );

        this.state.project = projectResponse.urlName;
        this.state.projectId = -1;
        this.state.username = userInfoMapper(
          getUserInfo(this.state.idToken)
        ).username;
        this.publishAuthState();
      }
    } else if (isAuthFlow('AZURE_AD_MULTI_TENANCY')) {
      log('authflow AZURE_AD_MULTI_TENANCY');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.getClient().http.setBearerToken(this.state.accessToken);

      if (!this.state.initialized && this.state.idToken) {
        log('starting oauth login for sdk client');
        this.getClient().loginWithOAuth({
          project: newTenant,
          accessToken: this.state.accessToken,
          onAuthenticate: async (login) => {
            if (isFunction(login)) {
              await login('AZURE_AD_MULTI_TENANCY', {
                cluster: this.getCluster(),
              });
              login.skip();
            }
          },
        });
        this.state.initialized = true;
        const projectResponse = await this.getClient().projects.retrieve(
          newTenant
        );

        this.state.project = projectResponse.urlName;
        this.state.projectId = -1;
        this.state.username = userInfoMapper(
          getUserInfo(this.state.idToken)
        ).username;
        this.publishAuthState();
        log('oauth login complete');
      }
    } else {
      log('NO AUTHFLOW');
      window.location.href = '/';
    }

    return this.getAuthState();
  }
}

export default CogniteAuth;

export type AuthenticatedUser = {
  authenticated: boolean;
  availableProjects?: AvailableProject[];
  initialising: boolean;
  project?: string;
  projectId?: number;
  tenant?: string;
  token?: string;
  username?: string;
};

export type AvailableProject = { urlName: string };
