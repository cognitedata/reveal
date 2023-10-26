import createAuth0Client from '@auth0/auth0-spa-js';

import { UserInfo } from './types';

export async function getUserInformation(
  clientId: string,
  domain: string,
  audience: string
): Promise<UserInfo> {
  const auth0 = await createAuth0Client({
    domain,
    client_id: clientId,
    cacheLocation: 'localstorage',
    audience,
    useRefreshTokens: true,
    redirect_uri: window.location.href,
  });
  const user = await auth0.getUser();
  return {
    id: user!.sub as string,
    displayName: user!.name,
    userPrincipalName: user!.sub,
    mail: user!.email,
  };
}

export async function getAccessToken(
  clientId: string,
  domain: string,
  audience: string,
  ignoreCache = false
) {
  const auth0 = await createAuth0Client({
    domain,
    client_id: clientId,
    cacheLocation: 'localstorage',
    audience,
    useRefreshTokens: true,
    redirect_uri: window.location.href,
  });
  const token = await auth0.getTokenSilently({ ignoreCache });
  if (!token) {
    throw new Error('Token not found');
  }
  return token;
}
export async function logout(
  clientId: string,
  domain: string,
  audience: string
) {
  const auth0 = await createAuth0Client({
    domain,
    client_id: clientId,
    cacheLocation: 'localstorage',
    audience,
    useRefreshTokens: true,
    redirect_uri: window.location.href,
  });
  await auth0.logout({
    returnTo: window.location.origin,
  });
}
