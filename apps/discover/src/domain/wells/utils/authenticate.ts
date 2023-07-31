import { CogniteWellsClient, createWellsClient } from '@cognite/sdk-wells';

let client: CogniteWellsClient;

export const authenticateWellSDK = (
  appId: string,
  baseUrl: string,
  project: string,
  accessToken?: string
) => {
  client = createWellsClient(appId, baseUrl);
  return client
    .loginWithToken({
      project,
      accessToken,
    })
    .then(() => client.experimental.enable());
};

export const isWellSDKAuthenticated = () => {
  return Boolean(client?.isLoggedIn);
};

export const getWellSDKClient = () => {
  return client;
};
