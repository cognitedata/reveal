import { Configuration, PublicClientApplication } from '@azure/msal-browser';
import { AuthFlow } from '@cognite/auth-utils';
import {
  CogniteAuthentication,
  isLoginPopupWindow,
  loginPopupHandler,
  REDIRECT,
} from '@cognite/sdk';
import { FakeIdp } from '@cognite/sidecar';
import { getFromLocalStorage, saveToLocalStorage } from '@cognite/storage';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import omit from 'lodash/omit';

import { FAKE_IDP_USER_LS_KEY } from '../LoginWithFakeIDP';

export const PROJECT_TO_LOGIN = 'project_to_login_by-redirect';

export class TokenFactory {
  readonly flow: AuthFlow | undefined;
  readonly project: string;
  readonly baseUrl: string;
  readonly aadApplicationId?: string;
  readonly cdfScopes?: string[];
  readonly fakeIdp?: FakeIdp[];
  readonly aadTenantId?: string;

  constructor({
    flow,
    project,
    baseUrl,
    aadApplicationId,
    fakeIdp = [],
    cdfScopes,
    aadTenantId,
  }: {
    flow: AuthFlow | undefined;
    project: string;
    baseUrl: string;
    aadApplicationId?: string;
    fakeIdp?: FakeIdp[];
    cdfScopes?: string[];
    aadTenantId?: string;
  }) {
    this.flow = flow;
    this.project = project;
    this.baseUrl = baseUrl;
    this.aadApplicationId = aadApplicationId;
    this.fakeIdp = fakeIdp;
    this.cdfScopes = cdfScopes;
    this.aadTenantId = aadTenantId;
  }
  private idTokenLocal: string | undefined = undefined;
  private emailLocal: string | undefined = undefined;

  public get idToken() {
    return this.idTokenLocal;
  }

  public get email() {
    return this.emailLocal;
  }

  getToken = () => {
    switch (this.flow) {
      case 'AZURE_AD': {
        if (this.aadApplicationId) {
          return this.getAzureToken;
        }
        throw new Error('Missing aadApplicationId for Azure AD');
      }
      case 'COGNITE_AUTH':
        return this.getLegacyToken;
      case 'FAKE_IDP':
        return this.getFakeIdpToken;
      default: {
        throw new Error(`Missing token factory for auth flow: ${this.flow}`);
      }
    }
  };

  /**
   * AZURE_AD
   * */
  private getAzureToken = async (): Promise<string> => {
    const defaultScopes = [`${this.baseUrl}/IDENTITY`];

    // concat dynamic scopes from sidecar with the default ones and filter out duplicates
    const scopes = Array.from(
      new Set(
        defaultScopes.concat(
          this.cdfScopes
            ? this.cdfScopes.map((scope) => `${this.baseUrl}/${scope}`)
            : []
        )
      )
    );

    const configuration: Configuration = {
      auth: {
        clientId: this.aadApplicationId || '',
        authority: `https://login.microsoftonline.com/${
          this.aadTenantId || 'common'
        }`,
        redirectUri: `${window.location.origin}`,
        navigateToLoginRequestUrl: true,
      },
    };

    const publicClientApplication = new PublicClientApplication(configuration);

    // try to get account from localstorage
    const accountId = getFromLocalStorage<string>(
      `${this.project}_localAccountId`
    );
    const account = publicClientApplication.getAccountByLocalId(
      accountId || ''
    );

    // if account not found trigger login with redirect and handle redirect
    // the handleRedirectPromise makes sure we come back at this page and set the authenticated user info
    if (!account) {
      await publicClientApplication.handleRedirectPromise();
      saveToLocalStorage(PROJECT_TO_LOGIN, this.project);
      await publicClientApplication.acquireTokenRedirect({
        prompt: 'select_account',
        scopes: ['User.Read'],
        extraScopesToConsent: scopes,
      });

      // don't want to return '' and trigger a different redirection in AuthContainer
      return 'redirect';
    }

    // Get token information.
    const token = await publicClientApplication.acquireTokenSilent({
      account,
      scopes,
    });
    this.idTokenLocal = token.idToken;
    this.emailLocal = account.username;

    return token.accessToken;
  };

  /**
   * COGNITE_OAUTH
   * */
  private getLegacyToken = async (): Promise<string> => {
    if (isLoginPopupWindow()) {
      loginPopupHandler();
    }

    const legacyInstance = new CogniteAuthentication({
      project: this.project,
      baseUrl: this.baseUrl,
    });

    await legacyInstance.handleLoginRedirect();
    let token = await legacyInstance.getCDFToken();
    if (token) {
      const parsedIdToken = jwtDecode<{ unique_name: string; sub: string }>(
        token.idToken
      );
      this.emailLocal = parsedIdToken?.unique_name || parsedIdToken?.sub;

      return token.accessToken;
    }
    token = await legacyInstance.login({ onAuthenticate: REDIRECT }).catch();
    if (token) {
      const parsedIdToken = jwtDecode<{ unique_name: string; sub: string }>(
        token.idToken
      );

      this.emailLocal = parsedIdToken?.unique_name || parsedIdToken?.sub;

      return token.accessToken;
    }
    throw new Error('Legacy login error');
  };

  /**
   * FakeIDP
   * */
  private getFakeIdpToken = async (): Promise<string> => {
    const userToAuth = getFromLocalStorage<string>(FAKE_IDP_USER_LS_KEY);
    const fakeIdpProject = this.fakeIdp?.find(
      (idp) => idp.name === userToAuth || idp.fakeApplicationId === userToAuth
    );

    if (fakeIdpProject) {
      const excludeList = ['idToken', 'accessToken', 'name'];
      const goodOptions = omit(fakeIdpProject, ...excludeList);
      return axios
        .post(`http://localhost:8200/login/token`, {
          ...goodOptions,
          // for testing expired tokens:
          // customExpiry: Math.floor(new Date().getTime() / 1000) + 15, // 15 second token
        })
        .then((result) => {
          this.idTokenLocal = result.data.id_token;
          const parsedIdToken = jwtDecode<{ user: string }>(
            this.idTokenLocal || ''
          );
          this.emailLocal = parsedIdToken?.user;

          return result.data.access_token;
        })
        .catch(() => {
          throw new Error('Do you have fakeIdp running?');
        });
    }
    throw new Error(`Missing fakeIdp config for project: ${this.project}`);
  };
}
