import { CogniteEvent, ExternalEvent, Sequence } from '@cognite/sdk';
import { NPT } from '@cognite/sdk-wells-v2';

import {
  TrajectoryData,
  Wellbore,
  WellboreAssetIdMap,
  WellboreExternalAssetIdMap,
} from '../types';

export const trimCachedData = (
  data: {
    [key: string]:
      | Sequence[]
      | CogniteEvent[]
      | TrajectoryData[]
      | ExternalEvent[]
      | NPT[];
  },
  wellboreIds: Wellbore['id'][]
) => {
  const newIds: Wellbore['id'][] = [];
  const trimmedData = wellboreIds.reduce((results, wellboreId) => {
    if (data[wellboreId]) {
      return { ...results, [wellboreId]: data[wellboreId] };
    }
    newIds.push(wellboreId);
    return results;
  }, {} as typeof data);
  return {
    trimmedData,
    newIds,
  };
};

export const getWellboreAssetIdReverseMap = (
  wellboreAssetIdMap: WellboreAssetIdMap
) => {
  return Object.keys(wellboreAssetIdMap)
    .map((key) => Number(key))
    .reduce(
      (idMap, wellboreId) => ({
        ...idMap,
        [wellboreAssetIdMap[wellboreId]]: wellboreId,
      }),
      {} as WellboreAssetIdMap
    );
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

export const mapLogType = (sequences: Sequence[], logType: string) =>
  sequences.map((sequence) => ({ ...sequence, logType }));
