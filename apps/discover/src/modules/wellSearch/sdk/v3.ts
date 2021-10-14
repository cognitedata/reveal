import {
  CogniteWellsClient,
  createWellsClient,
  WellItems,
} from '@cognite/sdk-wells-v3';

import { toIdentifier, toIdentifierItems } from './utils';

let client: CogniteWellsClient;

export const authenticateWellSDK = (
  appId: string,
  baseUrl: string,
  project: string,
  accessToken?: string
) => {
  client = createWellsClient(appId, baseUrl);

  client.loginWithToken({
    project,
    accessToken,
  });
};

export const getWellSDKClient = () => {
  return client;
};

export const getWellByMatchingId = async (id: number) => {
  return (
    client.wells.retrieveMultiple(
      toIdentifierItems([toIdentifier(id)])
    ) as Promise<WellItems>
  ).then((response) => response.items[0]);
};
