import { createWellsClient, Cluster } from '@cognite/sdk-wells';

import { log } from '_helpers/log';
import { SIDECAR } from 'constants/app';

const { applicationId } = SIDECAR;

const wellSDK = {
  client: createWellsClient(applicationId, Cluster.API),
};

export const authenticateWellSDK = (
  project: string,
  cluster: Cluster,
  accessToken?: string,
  apiKey?: string
) => {
  if (isWellSDKAuthed()) return;

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
  } else if (apiKey) {
    wellSDK.client.loginWithApiKey({
      project,
      apiKey,
    });
  }
};

export const getWellSDKClient = () => {
  return wellSDK.client;
};

export const isWellSDKAuthed = () => {
  return wellSDK.client.isLoggedIn;
};

export const getWellFilterLabels = () => {
  return isWellSDKAuthed() ? wellSDK.client.wells : null;
};

export const getWellFilterLimits = () => {
  return isWellSDKAuthed() ? wellSDK.client.wells.limits() : null;
};

export const getEventsFilterLabels = () => {
  return isWellSDKAuthed() ? wellSDK.client.events : null;
};
