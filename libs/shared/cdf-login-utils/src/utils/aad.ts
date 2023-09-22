import { PublicClientApplication } from '@azure/msal-browser';
import { noop } from 'lodash-es';

import { ADFS } from '@cognite/sdk-core';

import {
  getBaseUrl,
  getOrganization,
  setLoginOrganizationCookie,
} from './loginInfo';

const CACHE_CONFIG = {
  cacheLocation: 'localStorage',
  storeAuthStateInCookie: false,
};

const getRedirectUri = () => {
  return `${getBaseUrl()}/signin/callback`;
};

export const getPca = (
  clientId: string,
  authority?: string,
  knownAuthorities?: string[]
) => {
  return new PublicClientApplication({
    auth: {
      authority,
      clientId,
      knownAuthorities: knownAuthorities || [],
      redirectUri: getRedirectUri(),
    },
    cache: CACHE_CONFIG,
  });
};

const AAD_SCOPES = (cluster: string): string[] => [
  `https://${cluster}/IDENTITY`,
  `https://${cluster}/user_impersonation`,
  'User.Read',
];

export const getAADToken = async (
  cluster: string,
  pca: PublicClientApplication
) => {
  if (pca) {
    const activeAccount = pca.getActiveAccount();
    const { accessToken, idToken } = await pca.acquireTokenSilent({
      account: activeAccount ?? undefined,
      scopes: AAD_SCOPES(cluster),
    });

    return { accessToken, idToken };
  }

  return undefined;
};

export const loginRedirectAad = (
  pca: PublicClientApplication,
  scopes: string[],
  prompt?: string
) => {
  const org = getOrganization();
  if (!org) {
    throw new Error('No organization found');
  }
  setLoginOrganizationCookie(org);
  pca.loginRedirect({ scopes, prompt });
  // returning a non-resolving promise as we are redirecting the browser
  return new Promise(noop);
};

export const getAADB2CToken = getAADToken;

export const getADFS2016Token = async (
  authority: string,
  clientId: string,
  cluster: string
) => {
  const accessToken = await new ADFS({
    authority: `${authority}/authorize`,
    requestParams: {
      clientId,
      resource: `https://${cluster}`,
    },
  }).getCDFToken();

  if (!accessToken) {
    return Promise.reject('token not found');
  }

  return accessToken;
};
