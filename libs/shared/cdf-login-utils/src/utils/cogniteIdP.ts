import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

import { PublicOrgResponse } from '../types/cogniteIdp';

import { getApp, getOrganization, isAllowlistedHost } from './loginInfo';

export const getCogniteIdPUserManager = (params: {
  authority: string;
  client_id: string;
}) =>
  new UserManager({
    authority: params.authority,
    client_id: params.client_id,
    redirect_uri: window.location.href,
    scope: `openid offline_access email profile`,
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

export const getPublicOrg = async (
  options: { timeout?: number } = {}
): Promise<PublicOrgResponse | undefined> => {
  // Ignore clusters not supported by DLC for now (Aramco & OpenField)
  if (!isAllowlistedHost()) {
    return undefined;
  }

  const organization = getOrganization();

  const controller = new AbortController();
  if (options.timeout) {
    setTimeout(() => controller.abort(), options.timeout);
  }

  const response = await fetch(
    `https://auth.cognite.com/api/v0/orgs/${organization}/public`,
    {
      signal: controller.signal,
    }
  );
  const org = await response.json();
  if (!response.ok) {
    return undefined;
  }
  return org;
};

export const getClientId = () => {
  const app = getApp();
  if (app === 'fusion') {
    return '012c261c-0c5c-4ff6-9af1-20b9dfd81352';
  } else if (app === 'fusion-dev') {
    return 'e28859b5-1db0-44df-bbf3-d0a06758eecc';
  } else {
    throw new Error(`Unknown app: ${app}`);
  }
};
