import { IDPType, redirectToLogin } from '@cognite/login-utils';
import { CogniteClient } from '@cognite/sdk';

import { FusionTokenProvider } from './fusionTokenProvider';
import { UserInfo } from './types';
import { getBaseUrl, getCluster, getProject, getUrl } from './utils';

export { getIDP } from './utils';

export type AuthenticatedUser = {
  authenticated: boolean;
  username?: string;
  project?: string;
};

const urlCluster = getCluster();
const project = getProject();

const sdkTokenProvider = new FusionTokenProvider();

const getSdkBaseUrl = () => {
  return urlCluster ? getUrl(urlCluster) : undefined;
};

const sdkSingleton = new CogniteClient({
  appId: sdkTokenProvider.getAppId(),
  baseUrl: getSdkBaseUrl(),
  project,
  getToken,
});

const ensureCorrectBaseUrlP = urlCluster
  ? Promise.resolve()
  : getBaseUrl().then((baseUrl) => {
      if (baseUrl && baseUrl !== sdkSingleton.getBaseUrl()) {
        // @ts-ignore
        sdkSingleton.httpClient.setBaseUrl(getUrl(baseUrl));
      }
    });

export async function getUserInformation(): Promise<UserInfo> {
  return sdkTokenProvider.getUserInformation();
}

export function getFlow(): { flow: IDPType | undefined } {
  return sdkTokenProvider.getFlow() as { flow: IDPType | undefined };
}

export async function getToken() {
  // cyToken is used for e2e-tests
  const cyToken = localStorage.getItem('CY_TOKEN');
  if (cyToken) {
    return cyToken;
  }

  await ensureCorrectBaseUrlP;
  return sdkTokenProvider.getToken();
}

/**
 * Logout from the frontend only, login session will still be active on the IDP
 */
export async function logout() {
  return sdkTokenProvider.logout();
}

export default sdkSingleton;

let authInit: Promise<void> | undefined;
export function loginAndAuthIfNeeded(): Promise<void> {
  if (!authInit) {
    authInit = sdkSingleton
      .authenticate()
      // eslint-disable-next-line
      .then(() => {})
      .catch(() => {
        redirectToLogin();
      });
  }
  return authInit;
}
