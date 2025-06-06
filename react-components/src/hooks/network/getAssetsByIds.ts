import { type CogniteClient, type IdEither, type Asset } from '@cognite/sdk';

export const getAssetsByIds = async (
  sdk: CogniteClient,
  assetIds: IdEither[]
): Promise<Asset[]> => {
  if (assetIds.length === 0) return [];
  return await sdk.assets.retrieve(assetIds, { ignoreUnknownIds: true });
};
