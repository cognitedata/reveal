import { PublicClientApplication } from '@azure/msal-browser';
import { ADFS } from '@cognite/sdk-core';

const CACHE_CONFIG = {
  cacheLocation: 'localStorage',
  storeAuthStateInCookie: false,
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
      redirectUri: window.location.origin,
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
