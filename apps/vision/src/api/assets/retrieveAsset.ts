import sdk from '@cognite/cdf-sdk-singleton';
import { Asset } from '@cognite/sdk';

export const retrieveAsset = async (assetIds: number[]): Promise<Asset[]> =>
  sdk.assets.retrieve(assetIds.map((assetId) => ({ id: assetId })));
