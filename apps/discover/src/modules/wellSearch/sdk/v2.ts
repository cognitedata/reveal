import { createWellsClient, Cluster } from '@cognite/sdk-wells-v2';

import { log } from '_helpers/log';
import { SIDECAR } from 'constants/app';

const { applicationId } = SIDECAR;

const wellSDK = {
  client: createWellsClient(applicationId, Cluster.API),
};

export const authenticateWellSDK = (
  project: string,
  cluster: Cluster,
  accessToken?: string
) => {
  /**
   * By default client is initialized with API cluster,
   * If the cluster is changed in authentication, this will initialize the client with new cluster.
   */
  if (cluster && cluster !== Cluster.API) {
    wellSDK.client = createWellsClient(applicationId, cluster);
  }

  if (accessToken) {
    wellSDK.client.loginWithToken({
      project,
      accessToken,
      refreshToken: () => {
        log('Invalid token found. Trying to refresh', [], 0);
        return accessToken;
      },
    });
  }
};

export const getWellSDKClient = () => {
  return wellSDK.client;
};
