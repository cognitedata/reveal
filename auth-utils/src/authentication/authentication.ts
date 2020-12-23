/* eslint-disable no-console */
import { CogniteClient } from '@cognite/sdk';
import axios from 'axios';
import { Configuration } from '@azure/msal-browser';

import {
  clearByNoProject,
  clearByProject,
  isAuthFlow,
  isNoAuthFlow,
  retrieveAuthResult,
  saveAuthResult,
} from '../storage';
import { AuthFlow, AuthResult } from '../storage';
import AzureAD from '../aad/aad';
import {
  getUserInfo,
  processSigninResponse,
  signInWithADFSRedirect,
  userInfoMapper,
} from '../adfsModule';
import config from '../config';

const { cluster } = config;
console.log('[CogniteAuth] cluster', cluster);

class CogniteAuth {
  state: {
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
    initialized: false,
    initializing: true,
    authenticated: false,
  };

  azureAdClient: AzureAD | null = null;

  subscribers: {
    [appName: string]: (authState: AuthenticatedUser) => void;
  } = {};

  constructor(
    private client: CogniteClient,
    private msalConfig: Configuration,
    private cluster?: string
  ) {
    if (!cluster) this.cluster = 'greenfield';
    this.init(msalConfig);
  }

  private async init(msalConfig: Configuration) {
    console.log('[COGNITEAUTH]', 'init');
    await this.initAuth(msalConfig);
    if (this.isSignedIn()) {
      console.log('[COGNITEAUTH]', 'is Signed in');
      this.state.accessToken =
        this.state.authResult && this.state.authResult.accessToken;
      const projects = await this.listProjects();
      this.state.availableProjects = projects;
      this.state.authenticated = true;
      this.state.projectId = -1;
      this.state.idToken =
        this.state.authResult && this.state.authResult.idToken;
      this.state.username = userInfoMapper(
        getUserInfo(this.state.idToken)
      ).username;
      console.log('[COGNITEAUTH]', this.state.availableProjects);
      if (
        this.state.availableProjects &&
        this.state.availableProjects.length === 1
      ) {
        console.log('[COGNITEAUTH]', 'Auto selecting project');
        const selectedProject = this.state.availableProjects[0];
        this.state.project = selectedProject && selectedProject.urlName;
        if (this.state.project) {
          console.log('[COGNITEAUTH]', 'saving the authresult');
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
          if (window.location.pathname === '/') {
            // redirect only if we are on the root path
            window.location.href = `/${
              selectedProject.urlName
            }?env=${this.getCluster()}`;
          }
        }
      }
      this.publishAuthState();
      this.state.initializing = false;
    } else if (
      isAuthFlow('ADFS') ||
      isAuthFlow('AZURE_AD_MULTI_TENANCY') ||
      isNoAuthFlow()
    ) {
      if (window.location.pathname !== '/') {
        console.log(
          '[CogniteAuth]',
          'not signed in redirecting back to login page'
        );
        // eslint-disable-next-line no-unused-expressions
        window.location.href = '/';
      }
      console.log('[CogniteAuth] Not signed in, but on already on login page');
    } else {
      console.log('[CogniteAuth]', 'is not signed in');
    }
    this.state.initializing = false;
  }

  private async initAuth(msalConfig: Configuration) {
    const authCache = retrieveAuthResult();
    if (authCache && isAuthFlow('ADFS')) {
      console.log('Initialise ADFS');
      const authResult = processSigninResponse();
      this.cluster = 'sandfield';
      if (
        authResult &&
        authResult.accessToken &&
        authResult.accessToken.length !== 0
      ) {
        this.state.authResult = authResult;
      }
      return;
    } else if (authCache && isAuthFlow('AZURE_AD_MULTI_TENANCY')) {
      console.log('Initialise AZURE_AD_MULTI_TENANCY');
      this.azureAdClient = new AzureAD(msalConfig, this.cluster);
      const account = await this.azureAdClient.loadAuthModule();
      console.log('[COGNITEAUTH]', 'account', account);
      if (!account) {
        return;
      }
      const authResult = await this.azureAdClient.getProfileTokenRedirect();
      console.log('[COGNITEAUTH]', 'authResult', authResult);
      const cdfAccessToken = await this.azureAdClient.getCDFToken();
      console.log('[COGNITEAUTH]', 'cdfAccessToken', cdfAccessToken);
      if (authResult) {
        console.log(authResult);
        this.state.authResult = {
          authFlow: 'AZURE_AD_MULTI_TENANCY',
          accessToken: cdfAccessToken,
          idToken: authResult.idToken,
        };
        return;
      }
    }
  }

  private initialiseClient() {
    if (isAuthFlow('ADFS')) {
    } else if (isAuthFlow('AZURE_AD_MULTI_TENANCY')) {
    } else {
      console.error('Invalid oauth setup');
    }
  }

  public getAuthState(): AuthenticatedUser {
    return {
      authenticated: this.state.authenticated,
      project: this.state.project,
      projectId: this.state.projectId,
      tenant: this.state.project,
      initialising: this.state.initializing,
      username: this.state.username,
      availableProjects: this.state.availableProjects,
    };
  }

  public selectProject(project: string) {
    if (this.state.authResult) {
      saveAuthResult(this.state.authResult, project);
      clearByNoProject();
    }
  }

  private publishAuthState() {
    console.log('[CogniteAuth]', 'publishing authState', this.subscribers);
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

  private getAccessToken() {
    return this.state.authResult && this.state.authResult.accessToken;
  }
  private getCluster() {
    return this.cluster || 'api';
  }

  private async listProjects(): Promise<
    { urlName: string; cluster: string }[]
  > {
    try {
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

  public getClient() {
    return this.client;
  }

  public onAuthChanged(
    key: string,
    callback: (authenticatedUser: AuthenticatedUser) => void
  ) {
    this.subscribers[key] = callback;
    if (this.state.authenticated) {
      callback(this.getAuthState());
    }

    return () => {
      delete this.subscribers[key];
    };
  }

  public async login(authFlow: AuthFlow, project?: string, cluster?: string) {
    saveAuthResult({ authFlow }, project);
    if (authFlow === 'ADFS') {
      this.cluster = 'sandfield';
      await signInWithADFSRedirect();
    }
    if (authFlow === 'AZURE_AD_MULTI_TENANCY') {
      console.log('Not implemented yet');
      this.cluster = cluster;
      new AzureAD(this.msalConfig, this.cluster).login('loginRedirect');
    }

    if (authFlow === 'COGNITE_AUTH') {
      console.log('No special login except storing the given authFlow');
    }
  }

  public logout() {
    const project = this.state.project;
    if (project) {
      clearByProject(project);
    }
    window.location.href = '/';
  }

  public async loginAndAuthIfNeeded(newTenant: string, env?: string) {
    console.log('[CogniteAuth] loginAndAuthIfNeeded');
    if (!newTenant) {
      throw new Error('Supply tenant');
    }
    if (this.state.project && newTenant !== this.state.project) {
      // eslint-disable-next-line no-console
      console.warn(
        'You are changing the tenant,this might have unseen consequences!'
      );
    }

    this.client.setBaseUrl(`https://${env || 'api'}.cognitedata.com`);

    if (isAuthFlow('COGNITE_AUTH')) {
      console.log('[CogniteAuth] authflow COGNITE_AUTH');
      this.state.project = newTenant;
      this.state.username = undefined;

      if (!this.state.initialized) {
        this.client.loginWithOAuth({
          project: newTenant,
        });
        this.state.initialized = true;
      }

      let status = await this.client.login.status();
      if (!status || status.project !== newTenant) {
        this.state.authenticated = await this.client.authenticate();
        if (this.state.authenticated) {
          status = await this.client.login.status();
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
      console.log('[CogniteAuth] authflow ADFS');

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this.client.http.setBearerToken(this.state.accessToken);

      if (!this.state.initialized && this.state.idToken) {
        this.client.loginWithOAuth({
          project: newTenant,
          accessToken: this.state.accessToken,
          onTokens: (tokens) => {
            console.log(tokens);
          },
          onAuthenticate: async (login) => {
            await this.login('ADFS');
            login.skip();
          },
        });
        this.state.initialized = true;
        const groups = await this.client.groups.list();
        console.log('groups', groups);
        const projectResponse = await this.client.projects.retrieve(newTenant);

        this.state.project = projectResponse.urlName;
        this.state.projectId = -1;
        this.state.username = userInfoMapper(
          getUserInfo(this.state.idToken)
        ).username;
        this.publishAuthState();
      }
    } else if (isAuthFlow('AZURE_AD_MULTI_TENANCY')) {
      console.log('[CogniteAuth] authflow AZURE_AD_MULTI_TENANCY');

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this.client.http.setBearerToken(this.state.accessToken);

      if (!this.state.initialized && this.state.idToken) {
        this.client.loginWithOAuth({
          project: newTenant,
          accessToken: this.state.accessToken,
          onTokens: (tokens) => {
            console.log(tokens);
          },
          onAuthenticate: async (login) => {
            await this.login('AZURE_AD_MULTI_TENANCY', undefined, env);
            login.skip();
          },
        });
        this.state.initialized = true;
        const groups = await this.client.groups.list();
        console.log('groups', groups);
        const projectResponse = await this.client.projects.retrieve(newTenant);

        this.state.project = projectResponse.urlName;
        this.state.projectId = -1;
        this.state.username = userInfoMapper(
          getUserInfo(this.state.idToken)
        ).username;
        this.publishAuthState();
      }
    } else {
      console.log('[CogniteAuth] NO AUTHFLOW');
      // eslint-disable-next-line no-unused-expressions
      window.location.href = '/';
    }

    return this.getAuthState();
  }
}

export default CogniteAuth;

export type AuthenticatedUser = {
  authenticated: boolean;
  username?: string;
  tenant?: string;
  initialising: boolean;
  project?: string;
  projectId?: number;
  availableProjects?: AvailableProject[];
};

export type AvailableProject = { urlName: string };
