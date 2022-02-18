import isUndefined from 'lodash/isUndefined';
import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { ProjectConfigGeneral } from '@cognite/discover-api-types';
import { Cluster, NPTFilter } from '@cognite/sdk-wells-v2';

import { CommonWellFilter } from 'modules/wellSearch/types';

import {
  extractWellboresFromWells,
  mapSummaryCountsToStringArray,
  mapV2toV3NPTFilter,
  mapV3ToV2NPTItems,
  mapV3ToV2SourceItems,
  mapV3ToV2SpudDateLimits,
  mapV3ToV2Well,
  mapV3ToV2Wellbore,
  mapV3ToV2WellsWaterDepthLimits,
  mapWellFilterToWellFilterRequest,
  toIdentifier,
  toIdentifierItems,
} from './utils';
import {
  authenticateWellSDK as authenticateWellSDKV2,
  getWellSDKClient as getWellSDKClientV2,
} from './v2';
import {
  authenticateWellSDK as authenticateWellSDKV3,
  getWellSDKClient as getWellSDKClientV3,
  getWellByMatchingId,
} from './v3';

let globalEnableWellSDKV3: ProjectConfigGeneral['enableWellSDKV3'];

export const setEnableWellSDKV3 = (
  enableWellSDKV3?: ProjectConfigGeneral['enableWellSDKV3']
) => {
  globalEnableWellSDKV3 = isUndefined(enableWellSDKV3)
    ? false
    : enableWellSDKV3;
};

export const authenticateWellSDK = async (
  appId: string,
  baseUrl: string,
  project: string,
  cluster: Cluster,
  accessToken?: string
) => {
  if (globalEnableWellSDKV3) {
    authenticateWellSDKV3(appId, baseUrl, project, accessToken);
  } else {
    authenticateWellSDKV2(project, cluster, accessToken);
  }
};

export const isWellSDKAuthenticated = () => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3().isLoggedIn
    : getWellSDKClientV2().isLoggedIn;
};

export const getWellFilterFetchers = () => {
  if (!isWellSDKAuthenticated()) return null;

  const mdLimits = () => Promise.resolve([0, 50000]);
  const tvdLimits = () => Promise.resolve([0, 50000]);
  const kbLimits = () => Promise.resolve([0, 100]);
  const dogLegSeverityLimts = () => Promise.resolve([0, 100]);

  if (!globalEnableWellSDKV3) {
    const { fields, blocks, operators, measurements, regions } =
      getWellSDKClientV2().wells;
    return {
      fields,
      blocks,
      operators,
      measurements,
      regions,
      mdLimits,
      tvdLimits,
      kbLimits,
      dogLegSeverityLimts,
    };
  }

  return {
    fields: () =>
      // unused now, take from discover-api groups instead
      getWellSDKClientV3()
        .summaries.fields()
        .then(mapSummaryCountsToStringArray),
    blocks: () =>
      // unused now, take from discover-api groups instead
      getWellSDKClientV3()
        .summaries.blocks()
        .then(mapSummaryCountsToStringArray),
    operators: () =>
      getWellSDKClientV3()
        .summaries.operators()
        .then(mapSummaryCountsToStringArray),
    measurements: () =>
      getWellSDKClientV3()
        .summaries.measurementTypes()
        .then((results) => {
          return results.map((result) => result.type);
        }),
    regions: async () => {
      // unused now, take from discover-api groups instead
      const regions = await getWellSDKClientV3().summaries.regions();
      return mapSummaryCountsToStringArray(regions);
    },
    mdLimits,
    tvdLimits,
    kbLimits,
    dogLegSeverityLimts,
  };
};

export const getSources = () => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3().sources.list().then(mapV3ToV2SourceItems)
    : getWellSDKClientV2().wells.sources();
};

export const getWellsWaterDepthLimits = () => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.waterDepthLimits()
        .then(mapV3ToV2WellsWaterDepthLimits)
    : getWellSDKClientV2()
        .wells.limits()
        .then((response) => response.waterDepth);
};

export const getWellsSpudDateLimits = () => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.spudDateLimits()
        .then(mapV3ToV2SpudDateLimits)
    : getWellSDKClientV2()
        .wells.limits()
        .then((response) => response.spudDate);
};

export const getNPTDurationLimits = () => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.nptDurations()
        .then((response) => [
          Math.ceil(Number(response.min)),
          Math.floor(Number(response.max)),
        ])
    : getWellSDKClientV2()
        .wells.limits()
        .then((response) => [
          Math.ceil(Number(response.nptDuration.min)),
          Math.floor(Number(response.nptDuration.max)),
        ]);
};

export const getNPTCodes = () => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.nptCodes()
        .then(mapSummaryCountsToStringArray)
    : getWellSDKClientV2().events.nptCodes();
};

export const getNPTDetailCodes = () => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.nptDetailCodes()
        .then(mapSummaryCountsToStringArray)
    : getWellSDKClientV2().events.nptDetailCodes();
};

export const getNDSRiskTypes = () => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.ndsRiskTypes()
        .then(mapSummaryCountsToStringArray)
    : getWellSDKClientV2().events.ndsRiskTypes();
};

export const getWellById = (wellId: number) => {
  return globalEnableWellSDKV3
    ? getWellByMatchingId(wellId).then(mapV3ToV2Well)
    : getWellSDKClientV2().wells.getById(wellId);
};

// v2 only
export const getWellItemsByFilter = (wellFilter: CommonWellFilter) => {
  return getWellSDKClientV2().wells.filter(wellFilter);
};

export const getAllWellItemsByFilter = (
  wellFilter: CommonWellFilter,
  options?: FetchOptions
) => {
  return fetchAllCursors<unknown>({
    signal: options?.signal,
    action: getWellSDKClientV3().wells.list,
    actionProps: {
      ...mapWellFilterToWellFilterRequest(wellFilter),
      // limit: 101,
    },
  });
};

export const getWellboresFromWells = (wellIds: number[]) => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .wellbores.retrieveMultipleByWells(
          toIdentifierItems(wellIds.map(toIdentifier))
        )
        .then(extractWellboresFromWells)
        .then((wellbores) => wellbores.map(mapV3ToV2Wellbore))
    : getWellSDKClientV2().wellbores.getFromWells(wellIds);
};

export const getWellboresByIds = (wellboreIds: number[]) => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .wellbores.retrieveMultiple(
          toIdentifierItems(wellboreIds.map(toIdentifier))
        )
        .then((wellboreItems) => wellboreItems.items.map(mapV3ToV2Wellbore))
    : Promise.all(
        wellboreIds.map((item) => getWellSDKClientV2().wellbores.getById(item))
      );
};

export const getNPTItems = ({
  filter,
  cursor,
  limit,
}: {
  filter: NPTFilter;
  cursor?: string;
  limit?: number;
}) => {
  return globalEnableWellSDKV3
    ? getWellSDKClientV3()
        .npt.list({
          filter: mapV2toV3NPTFilter(filter),
          cursor,
          limit,
        })
        .then(mapV3ToV2NPTItems)
    : getWellSDKClientV2().events.listNPT(filter, cursor, limit);
};
