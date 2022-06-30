import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { WellboreExternalAssetIdMap, MeasurementV3 } from '../types';

/**
 * Matching id based function to use with sdk v2 types
 * @param data
 * @param wellboreMatchingIds
 * @returns
 */
export const trimCachedDataV3 = (
  data: {
    [key: string]: MeasurementV3[];
  },
  wellboreMatchingIds: Wellbore['matchingId'][]
) => {
  // We can derived type from the wellbore after matching id is not optional
  // const newIds: Wellbore['matchingId'][] = [];
  const newIds: string[] = [];
  const trimmedData = wellboreMatchingIds.reduce(
    (results, wellboreMatchingId) => {
      // This is due to matching id is optional in types because we use both sdks now
      if (wellboreMatchingId === undefined) return results;
      if (data[wellboreMatchingId]) {
        return { ...results, [wellboreMatchingId]: data[wellboreMatchingId] };
      }
      newIds.push(wellboreMatchingId);
      return results;
    },
    {} as typeof data
  );
  return {
    trimmedData,
    newIds,
  };
};

export const getWellboreExternalAssetIdReverseMap = (
  wellboreAssetIdMap: WellboreExternalAssetIdMap
) => {
  return Object.keys(wellboreAssetIdMap).reduce(
    (idMap, wellboreId: string) => ({
      ...idMap,
      [wellboreAssetIdMap[String(wellboreId)]]: wellboreId,
    }),
    {} as { [key: string]: string }
  );
};
