import './set-public-path';
import {
  getSelectedIdpDetails,
  Auth0Response,
  IDPType,
  KeycloakResponse,
} from '@cognite/login-utils';
import { ClientOptions, CogniteClient } from '@cognite/sdk';

import getAADAccessToken, {
  getUserInformation as getAADUserInfo,
  logout as aadLogout,
} from './aad';
import {
  getAccessToken as getADFSAccessToken,
  logout as adfsLogout,
} from './adfs2016';
import {
  logout as auth0Logout,
  getAccessToken as getAuth0AccessToken,
  getUserInformation as getAuth0UserInfo,
} from './auth0';
import {
  getAccessToken as getKeycloakAccessToken,
  logout as keycloakLogout,
  getUserInfo as getKeycloakUserInfo,
} from './keycloak';
import getLegacyToken, { logout as legacyLogout } from './legacy';
import { UserInfo } from './types';
import { getIDP, getBaseUrl, getCluster, getProject, getUrl } from './utils';

export { getIDP } from './utils';

export type AuthenticatedUser = {
  authenticated: boolean;
  username?: string;
  project?: string;
};

const urlCluster = getCluster();
const project = getProject();

const sdk = new CogniteClient({
  appId: 'fusion.cognite.com',
  getToken,
  baseUrl: urlCluster ? getUrl(urlCluster) : undefined,
  project,
});
export const getSDK = async (
  clientOptions?: ClientOptions
): Promise<CogniteClient> => {
  const baseUrl = await getBaseUrl();
  if (clientOptions) {
    return new CogniteClient(clientOptions);
  }
  return new CogniteClient({
    appId: 'fusion.cognite.com',
    getToken,
    baseUrl,
    project,
  });
};

/**
 * In order to support login via the frontend-proxy, while simultaneously supporting
 * cdf-ui-hub's cdf-hub-login-page, we want to expose this condition in order to know
 * appropriately which login flow to display, hence we export this single point of reference.
 */
export const isFrontendProxyLogin = window.location.href.includes('/cdf');

const ensureCorrectBaseUrlP = urlCluster
  ? Promise.resolve()
  : getBaseUrl().then((baseUrl) => {
      if (baseUrl && baseUrl !== sdk.getBaseUrl()) {
        // @ts-ignore
        sdk.httpClient.setBaseUrl(getUrl(baseUrl));
      }
    });

export async function getUserInformation(): Promise<UserInfo> {
  const idp = await getIDP();
  switch (idp.type) {
    case 'AZURE_AD': {
      return getAADUserInfo(idp.authority, idp.appConfiguration.clientId);
    }
    // case 'COGNITE_AUTH': {
    //   const { user } = await sdk.login.status();
    //   return { id: user, mail: user, displayName: user };
    // }
    case 'AUTH0': {
      return getAuth0UserInfo(
        idp.appConfiguration.clientId,
        idp.authority,
        (idp as Auth0Response).appConfiguration.audience || ''
      );
    }
    case 'KEYCLOAK': {
      const keycloakResponse = idp as KeycloakResponse;
      return getKeycloakUserInfo({
        authority: keycloakResponse.authority,
        clientId: keycloakResponse.appConfiguration.clientId,
        cluster: keycloakResponse.clusters[0],
        realm: keycloakResponse.realm,
        audience: keycloakResponse.appConfiguration.audience,
      });
    }
    default: {
      throw new Error('Unknown login type');
    }
  }
}

export function getFlow(): { flow: IDPType | undefined } {
  const { type } = getSelectedIdpDetails() ?? {};
  return { flow: type };
}

export async function getToken() {
  // use `getToken` method provided by test environment
  if (window?.testAuthOverrides) {
    return window.testAuthOverrides.getToken();
  }

  await ensureCorrectBaseUrlP;
  const idp = await getIDP();
  switch (idp.type) {
    case 'AZURE_AD': {
      return getAADAccessToken(idp.authority, idp.appConfiguration.clientId);
    }
    case 'COGNITE_AUTH': {
      return getLegacyToken();
    }
    case 'ADFS2016': {
      return getADFSAccessToken(
        `${idp.authority}/authorize`,
        idp.appConfiguration.clientId
      );
    }
    case 'AUTH0': {
      return getAuth0AccessToken(
        idp.appConfiguration.clientId,
        idp.authority,
        (idp as Auth0Response).appConfiguration.audience || ''
      );
    }
    case 'KEYCLOAK': {
      const keycloakResponse = idp as KeycloakResponse;
      const token = await getKeycloakAccessToken({
        authority: keycloakResponse.authority,
        clientId: keycloakResponse.appConfiguration.clientId,
        cluster: keycloakResponse.clusters[0],
        realm: keycloakResponse.realm,
        audience: keycloakResponse.appConfiguration.audience,
      });
      return token;
    }
    default: {
      throw new Error('Unknown login type');
    }
  }
}

/**
 * Logout from the frontend only, login session will still be active on the IDP
 */
export async function logout() {
  const idp = await getIDP();
  switch (idp.type) {
    case 'AZURE_AD': {
      await aadLogout(idp.authority, idp.appConfiguration.clientId);
      break;
    }
    case 'AUTH0': {
      await auth0Logout(
        idp.appConfiguration.clientId,
        idp.authority,
        (idp as Auth0Response).appConfiguration.audience || ''
      );
      break;
    }
    case 'ADFS2016': {
      adfsLogout(idp.authority);
      break;
    }
    case 'COGNITE_AUTH': {
      legacyLogout();
      break;
    }
    case 'KEYCLOAK': {
      const keycloakResponse = idp as KeycloakResponse;
      await keycloakLogout({
        authority: keycloakResponse.authority,
        clientId: keycloakResponse.appConfiguration.clientId,
        cluster: keycloakResponse.clusters[0],
        realm: keycloakResponse.realm,
        audience: keycloakResponse.appConfiguration.audience,
      });
      break;
    }
  }
  window.location.href = '/';
}

export default sdk;

let authInit: Promise<void> | undefined;
export function loginAndAuthIfNeeded(): Promise<void> {
  if (!authInit) {
    authInit = sdk
      .authenticate()
      // eslint-disable-next-line lodash/prefer-noop
      .then(() => {})
      .catch(() => {
        window.location.href = '/';
      });
  }
  return authInit;
}
