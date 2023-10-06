import { User, UserManager } from 'oidc-client-ts';

import {
  cogniteIdPSignInRedirect,
  getBaseUrl,
  getCogniteIdPUserManager,
  getRequiredOrganization,
  isPreviewDeployment,
  removeSelectedIdpDetails,
  setRedirectCookieForPreviewDeployment,
} from '@cognite/login-utils';

import { UserInfo } from './types';

export const getUser = async (
  userManager: UserManager,
  signInIfUnAuthenticated: boolean
): Promise<User> => {
  const user = await userManager.getUser();
  if (!user || user.expired) {
    const organization = getRequiredOrganization();
    if (signInIfUnAuthenticated) {
      await cogniteIdPSignInRedirect(userManager, organization);
    }
    throw new Error('User not found');
  }
  return user;
};

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
    getUser(userManager, true)
      .then((user) => resolve(user.access_token))
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
  const user = await getUser(userManager, false);
  return {
    id: user.profile.sub,
    displayName: user.profile.name,
    mail: user.profile.email,
    userPrincipalName: user.profile.sub,
    profilePicture: user.profile.picture,
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

  removeSelectedIdpDetails();
  const redirectUri = getBaseUrl();

  if (isPreviewDeployment) {
    setRedirectCookieForPreviewDeployment(redirectUri);
    await userManager.signoutRedirect({
      post_logout_redirect_uri:
        'https://oauth.preview.cogniteapp.com/signout/callback',
    });
  } else {
    await userManager.signoutRedirect({
      post_logout_redirect_uri: redirectUri,
    });
  }
};
