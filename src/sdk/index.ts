/**
 * In Fusion, SDK is handled via the @cognite/cdf-sdk-singleton dependency.
 * This dependency is injected into Fusion via single SPA and therefore
 * not available outside Fusion.
 * To avoid the Legacy Charts build breaking due to @cognite/cdf-sdk-singleton
 * not being found, we use this file as a fallback if it was not found.
 * It maps the utils used in @cognite/cdf-sdk-singleton to parallell utils
 * used for Legacy Charts interactions with SDK.
 */

import { CogniteClient } from '@cognite/sdk';
import { getFlow as getFlowAuthUtils } from '@cognite/auth-utils';
import { getProject, getCluster } from '@cognite/cdf-utilities';

export const getFlow = () => {
  const cluster = getCluster();
  const project = getProject();
  const { flow } = getFlowAuthUtils(project, cluster);
  return { flow };
};

/**
 * TODO(DEGR-838): this cannot be used in SDK initialization since the token
 * does not exist yet - find a way to initialize SDK and use a token retrospectively
 */
export const getToken = async () => {
  const { flow } = getFlow();
  // @ts-ignore
  if (flow === 'AZURE_AD') return sdk.getAzureADAccessToken();
  // @ts-ignore
  if (flow === 'COGNITE_AUTH') return sdk.getCDFToken();
  return 'TODO';
};

let authInit: Promise<void> | undefined;
export const loginAndAuthIfNeeded = (): Promise<void> => {
  if (!authInit) {
    authInit = sdk
      .authenticate()
      .then(() => {})
      .catch(() => {
        window.location.href = '/';
      });
  }
  return authInit;
};

export const getUserInformation = () => {
  return {
    mail: 'TODO',
    displayName: 'TODO',
  };
};

const sdk: CogniteClient = new CogniteClient({
  appId: 'Cognite Charts',
  project: getProject(), // TODO(DEGR-838)
  /**
   * This token is needed to connect to Firebase - if it's not present,
   * /login/firebase endpoint will fail with code 401.
   */
  getToken,
});

export default sdk;
