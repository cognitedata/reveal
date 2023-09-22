/* eslint-disable class-methods-use-this */
import {
  Auth0Response,
  CogniteIdPResponse,
  KeycloakResponse,
  getSelectedIdpDetails,
  removeSelectedIdpDetails,
} from '@cognite/login-utils';

import getAADAccessToken, {
  logout as aadLogout,
  getUserInformation as getAADUserInfo,
} from './aad';
import {
  logout as adfsLogout,
  getAccessToken as getADFSAccessToken,
} from './adfs2016';
import {
  logout as auth0Logout,
  getAccessToken as getAuth0AccessToken,
  getUserInformation as getAuth0UserInfo,
} from './auth0';
import {
  getAccessToken as getCogniteAccessToken,
  getUserInfo as getCogniteUserInfo,
  logout as cogniteLogout,
} from './cogIdp';
import {
  getAccessToken as getKeycloakAccessToken,
  getUserInfo as getKeycloakUserInfo,
  logout as keycloakLogout,
} from './keycloak';
import getLegacyToken, { logout as legacyLogout } from './legacy';
import { SdkClientTokenProvider, UserInfo } from './types';
import { getIDP } from './utils';

/**
 * This is the default token provider used in fusion.cognite.com.
 * For unified sign-in and others, different one will be provided when calling the create function.
 *
 * NOTE: This code will be soon depricated when unified sign-in is fully rolled out.
 */
export class FusionTokenProvider implements SdkClientTokenProvider {
  getAppId() {
    return 'fusion.cognite.com';
  }

  async getToken(): Promise<string> {
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
          // eslint-disable-next-line
          (idp as Auth0Response).appConfiguration.audience!
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
      case 'COGNITE_IDP': {
        const cogniteIdPResponse = idp as CogniteIdPResponse;
        const token = await getCogniteAccessToken({
          authority: cogniteIdPResponse.authority,
          clientId: cogniteIdPResponse.appConfiguration.clientId,
        });
        return token;
      }
      default: {
        throw new Error('Unknown login type');
      }
    }
  }

  async getUserInformation(): Promise<UserInfo> {
    const idp = await getIDP();
    switch (idp.type) {
      case 'AZURE_AD': {
        return getAADUserInfo(idp.authority, idp.appConfiguration.clientId);
      }
      case 'AUTH0': {
        return getAuth0UserInfo(
          idp.appConfiguration.clientId,
          idp.authority,
          // eslint-disable-next-line
          (idp as Auth0Response).appConfiguration.audience!
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
      case 'COGNITE_IDP': {
        const cogniteIdPResponse = idp as CogniteIdPResponse;
        return getCogniteUserInfo({
          authority: cogniteIdPResponse.authority,
          clientId: cogniteIdPResponse.appConfiguration.clientId,
        });
      }
      default: {
        throw new Error('Unknown login type');
      }
    }
  }

  getFlow(): { flow: any } {
    const { type } = getSelectedIdpDetails() ?? {};
    return { flow: type };
  }

  async logout(): Promise<void> {
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
          // eslint-disable-next-line
          (idp as Auth0Response).appConfiguration.audience!
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
      case 'COGNITE_IDP': {
        const cogniteIdPResponse = idp as CogniteIdPResponse;
        await cogniteLogout({
          authority: cogniteIdPResponse.authority,
          clientId: cogniteIdPResponse.appConfiguration.clientId,
        });
        break;
      }
    }
    removeSelectedIdpDetails();
    window.location.href = '/';
  }
}
