/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getBaseUrl, getCogniteIdPUserManager } from '@cognite/login-utils';

import { UserInfo } from './types';

/**
 * This is set up to avoid parallel token refresh requests.
 * See the keycloak implementation for more details.
 */
let getAccessTokenPromise: Promise<string> | undefined;
export const getAccessToken = async (params: {
  authority: string;
  clientId: string;
}) => {
  if (getAccessTokenPromise) {
    return getAccessTokenPromise;
  }
  getAccessTokenPromise = new Promise<string>((resolve, reject) => {
    const userManager = getCogniteIdPUserManager({
      authority: params.authority,
      client_id: params.clientId,
    });
    userManager
      .getUser()
      .then((user) => {
        if (user?.expired) {
          return userManager.signinSilent();
        }
        return user;
      })
      .then((user) => resolve(user!.access_token))
      .catch(reject)
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
}): Promise<UserInfo> => {
  const userManager = getCogniteIdPUserManager({
    authority: params.authority,
    client_id: params.clientId,
  });
  const user = await userManager.getUser();
  return {
    id: user!.profile.sub,
    displayName: user!.profile.name,
    mail: user!.profile.email,
    userPrincipalName: user!.profile.sub,
    profilePicture: user!.profile.picture,
  };
};

export const logout = async (params: {
  authority: string;
  clientId: string;
}): Promise<void> => {
  const userManager = getCogniteIdPUserManager({
    authority: params.authority,
    client_id: params.clientId,
  });
  await userManager.signoutRedirect({
    post_logout_redirect_uri: getBaseUrl(),
  });
};
