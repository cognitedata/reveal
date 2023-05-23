import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

export const getUserManager = (params: {
  authority: string;
  client_id: string;
  cluster: string;
  realm?: string;
  audience?: string;
}) =>
  new UserManager({
    authority: params.realm
      ? `${params.authority}/realms/${params.realm}`
      : params.authority,
    client_id: params.client_id,
    redirect_uri: window.location.href,
    scope: params.realm
      ? `openid profile https://${params.cluster} user_impersonation IDENTITY`
      : params.audience,
    automaticSilentRenew: false,
    userStore: new WebStorageStateStore({
      store: window.localStorage,
      prefix: params.realm
        ? `oidc:user:${params.authority}/realms/${params.realm}`
        : `oidc:user:${params.authority}/`,
    }),
    stateStore: new WebStorageStateStore({
      store: window.localStorage,
      prefix: params.realm
        ? `oidc:state:${params.authority}/realms/${params.realm}`
        : `oidc:state:${params.authority}/`,
    }),
  });

export const getKeycloakToken = async (userManager: UserManager) => {
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
