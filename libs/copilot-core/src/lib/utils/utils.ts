import type { CogniteClient } from '@cognite/sdk/dist/src';

// Convert external id to id
export const getAssetByExternalId = async (
  externalId: string,
  sdk: CogniteClient
) => {
  const assets = await sdk.assets.retrieve([{ externalId: externalId }]);
  return assets[0].id;
};

export const retrieveAsset = async (externalId: string, sdk: CogniteClient) => {
  return await sdk.assets.retrieve([{ externalId: externalId }]);
};
