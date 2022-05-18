import { Identifier, Wellbore, AssetSource } from '@cognite/sdk-wells-v3';

export const convertToIdentifiers = (
  ids: Set<Wellbore['matchingId']> | Set<AssetSource['assetExternalId']>,
  mapToMatchingID = true
): Identifier[] => {
  const idsArray = Array.from(ids);
  if (mapToMatchingID) {
    return idsArray.map(toIdentifierWithMatchingId);
  }
  return idsArray.map(toIdentifierWithAssetExternalId);
};

export const toIdentifierWithMatchingId = (
  matchingId: Wellbore['matchingId']
): Identifier => {
  return { matchingId };
};

export const toIdentifierWithAssetExternalId = (
  assetExternalId: AssetSource['assetExternalId']
): Identifier => {
  return { assetExternalId };
};
