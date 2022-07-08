import { Identifier, AssetSource } from '@cognite/sdk-wells';

export const toIdentifierWithAssetExternalId = (
  assetExternalId: AssetSource['assetExternalId']
): Identifier => {
  return { assetExternalId };
};
