import { generateRedirectUri } from '@cognite/auth-react';
import {
  clearLoginHints,
  clearUrlLoginHints,
} from '@cognite/auth-react/src/lib/base';
import { IDPType } from '@cognite/login-utils';
import { ClientOptions, CogniteClient } from '@cognite/sdk';

import { FusionTokenProvider } from './fusionTokenProvider';
import './set-public-path';
import { SdkClientTokenProvider, UserInfo } from './types';
import { isUsingUnifiedSignin } from './unified-signin';
import { UnifiedSigninTokenProvider } from './unifiedSigninTokenProvider';
import {
  convertToProxy,
  getBaseUrl,
  getCluster,
  getProject,
  getUrl,
} from './utils';

export { getIDP } from './utils';
// import { isProduction } from '../environment';

export { isUsingUnifiedSignin, unifiedSignInAppName } from './unified-signin';

export type AuthenticatedUser = {
  authenticated: boolean;
  username?: string;
  project?: string;
};

const urlCluster = getCluster();
const project = getProject();

let sdkTokenProvider: SdkClientTokenProvider = isUsingUnifiedSignin()
  ? new UnifiedSigninTokenProvider()
  : new FusionTokenProvider();

/**
 * Creates a CogniteSDK Client.
 * When served from fusion it uses the default token provider
 * When used from unified signin, the provider is passed as arg
 */
export const createSdkClient = (
  clientOptions: ClientOptions,
  tokenProvider?: SdkClientTokenProvider
): CogniteClient => {
  sdkTokenProvider =
    tokenProvider || isUsingUnifiedSignin()
      ? new UnifiedSigninTokenProvider()
      : new FusionTokenProvider();
  return new CogniteClient({
    ...clientOptions,
    appId: sdkTokenProvider.getAppId(),
    getToken,
  });
};

const getSdkBaseUrl = () => {
  return urlCluster ? getUrl(urlCluster) : undefined;
};

const sdkSingleton = convertToProxy(
  createSdkClient({
    appId: sdkTokenProvider.getAppId(),
    baseUrl: getSdkBaseUrl(),
    project,
  })
) as unknown as CogniteClient;

// eslint-disable-next-line @cognite/no-unissued-todos
// TODO: Not sure where and how it is used, will leave it as it is for now...
export const getSDK = async (
  clientOptions?: ClientOptions
): Promise<CogniteClient> => {
  const baseUrl = await getBaseUrl();
  if (clientOptions) {
    return new CogniteClient(clientOptions);
  }
  return new CogniteClient({
    appId: sdkTokenProvider.getAppId(),
    getToken,
    baseUrl,
    project,
  });
};

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

/**
 * Some background for this and why going this route....
 * For Unified signin, we are using methods like getToken and others from auth-react.
 * Those are wrapped inside provider and you can get them only via react hooks.
 *
 * To make fusion, working with both fusion.cognite.com and apps.cognite.com/cdf (unified signin),
 * we need to inject/override those methods from the sdk with the ones from auth-react package.
 *
 * All sub-apps in fusion are importing and using this sdk package directly ex:
 * import sdk from @cognite/cdf-sdk-singleton
 *
 * The problem now is that cdf-sdk-singleton, previously exported the sdk as default export.
 * With this, you are going to get a read-only copy of this file (sdk instance).
 * This means that it is impossible to override or extend the functionality.
 *
 * To avoid changing all sub-apps and making a lot of changes, the easiest solution is to export a proxy object.
 * When exporting object, you can override the properties (sdk).
 * We are going to do this only in the shared auth-wrapper and avoid changing all subapps
 */
export default sdkSingleton;

let authInit: Promise<void> | undefined;
export function loginAndAuthIfNeeded(): Promise<void> {
  if (!authInit) {
    authInit = sdkSingleton
      .authenticate()
      // eslint-disable-next-line
      .then(() => {})
      .catch(() => {
        if (isUsingUnifiedSignin()) {
          clearUrlLoginHints();
          clearLoginHints();
          window.location.href = generateRedirectUri();
        } else {
          window.location.href = '/';
        }
      });
  }
  return authInit;
}
