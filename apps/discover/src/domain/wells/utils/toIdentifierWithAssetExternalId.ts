import { Identifier, AssetSource } from '@cognite/sdk-wells-v3';

export const toIdentifierWithAssetExternalId = (
  assetExternalId: AssetSource['assetExternalId']
): Identifier => {
  return { assetExternalId };
};
