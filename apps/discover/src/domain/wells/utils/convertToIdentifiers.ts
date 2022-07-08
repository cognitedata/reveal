import { Identifier, Wellbore, AssetSource } from '@cognite/sdk-wells-v3';

import { toIdentifierWithAssetExternalId } from './toIdentifierWithAssetExternalId';
import { toIdentifierWithMatchingId } from './toIdentifierWithMatchingId';

type IdsType =
  | Set<Wellbore['matchingId']>
  | Set<AssetSource['assetExternalId']>
  | Array<Wellbore['matchingId']>
  | Array<AssetSource['assetExternalId']>;

export const convertToIdentifiers = (
  ids: IdsType,
  mapToMatchingID = true
): Identifier[] => {
  const idsArray = Array.from(ids);
  if (mapToMatchingID) {
    return idsArray.map(toIdentifierWithMatchingId);
  }
  return idsArray.map(toIdentifierWithAssetExternalId);
};
