import { Identifier, Wellbore, AssetSource } from '@cognite/sdk-wells-v3';

import { toIdentifierWithAssetExternalId } from './toIdentifierWithAssetExternalId';
import { toIdentifierWithMatchingId } from './toIdentifierWithMatchingId';

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
