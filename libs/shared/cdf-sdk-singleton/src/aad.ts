import { PublicClientApplication } from '@azure/msal-browser';

import { UserInfo } from './types';
import { getBaseUrl } from './utils';

const getAuthConfig = (authority: string, clientId: string) => ({
  clientId,
  authority,
  redirectUri: `https://${window.location.host}`,
});

const CACHE_CONFIG = {
  cacheLocation: 'localStorage',
  storeAuthStateInCookie: false,
};

export async function getUserInformation(
  authority: string,
  clientId: string
): Promise<UserInfo> {
  const pca = new PublicClientApplication({
    auth: getAuthConfig(authority, clientId),
    cache: CACHE_CONFIG,
  });

  const account = pca.getActiveAccount();

  if (!account) {
    throw new Error('no user found');
  }
  const token = await pca.acquireTokenSilent({
    account,
    scopes: ['User.Read'],
  });
  const profile = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token.accessToken}`,
    },
  }).then((r) => r.json());
  return profile as UserInfo;
}

export default async function getCDFAccessToken(
  authority: string,
  clientId: string
): Promise<string> {
  const baseUrl = await getBaseUrl();
  const scopes = [`${baseUrl}/IDENTITY`, `${baseUrl}/user_impersonation`];
  const pca = new PublicClientApplication({
    auth: getAuthConfig(authority, clientId),
    cache: CACHE_CONFIG,
  });

  // Normally this is handled in the login page, but will be handled here if the redirect flow was
  // kicked of inside Fusion. AAD will redirect back to the page root with the hash in the URL. The
  // url is the copied to session storage and MSAL will redirect back to the url where the redirect
  // was started. The hash in sessionStorage is then parsed and copied to local storage by the next
  // line.
  const redirectResult = await pca.handleRedirectPromise();
  if (redirectResult) {
    pca.setActiveAccount(redirectResult.account);
  }
  const account = pca.getActiveAccount();

  try {
    if (!account) {
      throw new Error('no user found');
    }
    const { accessToken } = await pca.acquireTokenSilent({
      account,
      scopes,
    });
    return accessToken;
  } catch (e) {
    await pca.loginRedirect({
      prompt: 'select_account',
      scopes,
      redirectStartPage: window.location.href,
    });
  }
  throw new Error('Access token was not found');
}

export async function logout(authority: string, clientId: string) {
  const pca = new PublicClientApplication({
    auth: getAuthConfig(authority, clientId),
    cache: CACHE_CONFIG,
  });
  const account = pca.getActiveAccount();
  // @ts-ignore
  pca.logoutRedirect({
    account,
    onRedirectNavigate: () => false,
  });
  pca.setActiveAccount(null);
}
