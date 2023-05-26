import { getUserManager } from '@cognite/login-utils';

import { UserInfo } from './types';

/**
 * This is set up to avoid parallel token refresh requests because
 *
 * 1. Keycloak maintains user sessions and refresh tokens are associated with that session.
 * 2. Using a refresh token invalidates it, the new refresh token in the refresh request have to be used.
 *
 * This becomes problematic if multiple parallel requests in the SDK results in a 401, where each of
 * the requests will trigger a token refresh (there is not "single threading" of token refresh
 * inside the SDK).
 *
 * One downside of this is that you can't trust the SDK to retry all 401s. Multiple requests will
 * trigger multiple refresh calls, but all of them will return the same promise/resolved token. The
 * SDK will compare "new" and "old" tokens when refreshing tokens to avoid a 401-retry-loop. But
 * since multiple calls resolves the same value it looks to the SDK as the.
 *
 * Using react-query with retry enabled (default setting) will handles this, the requests will look
 * like a regular rejected promise.
 */
let getAccessTokenPromise: Promise<string> | undefined;
export const getAccessToken = (params: {
  authority: string;
  clientId: string;
  cluster: string;
  realm?: string;
  audience?: string;
}) => {
  if (getAccessTokenPromise) {
    return getAccessTokenPromise;
  }
  getAccessTokenPromise = new Promise<string>((resolve, reject) => {
    const userManager = getUserManager({
      client_id: params.clientId,
      ...params,
    });
    userManager
      .getUser()
      .then((user) => {
        if (user?.expired) {
          return userManager.signinSilent();
        }
        return user;
      })
      .then((user) => resolve(user?.access_token || ''))
      .catch((e) => {
        reject(e);
      })
      .finally(() => userManager.clearStaleState());
  });

  getAccessTokenPromise.then(() => {
    getAccessTokenPromise = undefined;
  });
  return getAccessTokenPromise;
};

export const getUserInfo = async (params: {
  authority: string;
  clientId: string;
  cluster: string;
  realm?: string;
  audience?: string;
}): Promise<UserInfo> => {
  const userManager = getUserManager({
    client_id: params.clientId,
    ...params,
  });
  const user = await userManager.getUser();
  return {
    id: user?.profile.sid || '',
    displayName: user?.profile.preferred_username,
    mail: user?.profile.email,
    userPrincipalName: user?.profile.sub,
  };
};

export const logout = async (params: {
  authority: string;
  clientId: string;
  cluster: string;
  realm?: string;
  audience?: string;
}): Promise<void> => {
  const userManager = getUserManager({
    client_id: params.clientId,
    ...params,
  });
  await userManager.signoutRedirect({
    post_logout_redirect_uri: window.location.origin,
  });
};
