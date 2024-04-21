/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type IdEither, type Asset } from '@cognite/sdk';

export const getAssetsByIds = async (
  sdk: CogniteClient,
  assetIds: IdEither[]
): Promise<Asset[]> => {
  return await sdk.assets.retrieve(assetIds, { ignoreUnknownIds: true });
};
