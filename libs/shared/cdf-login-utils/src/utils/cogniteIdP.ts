import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

export const getCogniteIdPUserManager = (params: {
  authority: string;
  client_id: string;
}) =>
  new UserManager({
    authority: params.authority,
    client_id: params.client_id,
    redirect_uri: window.location.href,
    scope: `openid offline email profile`,
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({
      store: window.localStorage,
      prefix: `oidc:user:${params.authority}/`,
    }),
    stateStore: new WebStorageStateStore({
      store: window.localStorage,
      prefix: `oidc:state:${params.authority}/`,
    }),
  });

export const getCogniteIdPToken = async (userManager: UserManager) => {
  try {
    await userManager.signinSilent();
    let user = await userManager.getUser();
    if (user?.expired) {
      user = await userManager.signinSilent();
    }
    if (!user?.access_token) {
      return undefined;
    }
    return user.access_token;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return undefined;
  }
};
