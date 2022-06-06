import { CogniteWellsClient, createWellsClient } from '@cognite/sdk-wells-v3';

let client: CogniteWellsClient;

export const authenticateWellSDK = (
  appId: string,
  baseUrl: string,
  project: string,
  accessToken?: string
) => {
  client = createWellsClient(appId, baseUrl);
  return client.loginWithToken({
    project,
    accessToken,
  });
};

export const getWellSDKClient = () => {
  return client;
};
