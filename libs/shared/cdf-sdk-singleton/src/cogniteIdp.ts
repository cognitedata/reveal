import { getCogniteIdPUserManager } from '@cognite/login-utils';

import { UserInfo } from './types';

export const getAccessToken = async (params: {
  authority: string;
  clientId: string;
}) => {
  const userManager = getCogniteIdPUserManager({
    authority: params.authority,
    client_id: params.clientId,
  });

  const user = await userManager.signinSilent();
  return user!.access_token;
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
    post_logout_redirect_uri: window.location.origin,
  });
};
