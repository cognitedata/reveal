import {
  CogniteWellsClient,
  createWellsClient,
  WellItems,
} from '@cognite/sdk-wells-v3';

import { WellId } from '../types';

import { toIdentifier, toIdentifierItems } from './utils';

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

export const getWellByMatchingId = async (id: WellId) => {
  return (
    client.wells.retrieveMultiple(
      toIdentifierItems([toIdentifier(id)])
    ) as Promise<WellItems>
  ).then((response) => {
    return response.items[0];
  });
};

export const getWellsByMatchingIds = async (ids: WellId[]) => {
  return (
    client.wells.retrieveMultiple(
      toIdentifierItems(ids.map((id) => toIdentifier(id)))
    ) as Promise<WellItems>
  ).then((response) => {
    return response.items;
  });
};
