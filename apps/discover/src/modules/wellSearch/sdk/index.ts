import isUndefined from 'lodash/isUndefined';

import { getTenantInfo } from '@cognite/react-container';
import { Cluster, WellFilter, NPTFilter } from '@cognite/sdk-wells-v2';

import { fetcher } from 'hooks/useTenantConfig';
import { TenantConfig } from 'tenants/types';

import {
  extractWellboresFromWells,
  getMeasurementsFromDepthMeasurementItems,
  mapSummaryCountsToStringArray,
  mapV2toV3NPTFilter,
  mapV3ToV2NPTItems,
  mapV3ToV2SourceItems,
  mapV3ToV2SpudDateLimits,
  mapV3ToV2Well,
  mapV3ToV2Wellbore,
  mapV3ToV2WellItems,
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

let enableWellSDKV3: TenantConfig['enableWellSDKV3'];

export const isWellSDKV3Enabled = async () => {
  if (!isUndefined(enableWellSDKV3)) return enableWellSDKV3;

  const [tenant] = getTenantInfo();
  const tenantConfig = await fetcher(tenant);
  const isEnabled = tenantConfig.enableWellSDKV3;

  enableWellSDKV3 = isUndefined(isEnabled) ? false : isEnabled;
  return enableWellSDKV3;
};

export const authenticateWellSDK = async (
  appId: string,
  baseUrl: string,
  project: string,
  cluster: Cluster,
  accessToken?: string
) => {
  if (isWellSDKAuthenticated()) return;

  const enableWellSDKV3 = await isWellSDKV3Enabled();

  if (enableWellSDKV3) {
    authenticateWellSDKV3(appId, baseUrl, project, accessToken);
  } else {
    authenticateWellSDKV2(project, cluster, accessToken);
  }
};

export const isWellSDKAuthenticated = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3().isLoggedIn
    : getWellSDKClientV2().isLoggedIn;
};

export const getWellFilterFetchers = () => {
  if (!isWellSDKAuthenticated()) return null;

  if (!enableWellSDKV3) {
    const { fields, blocks, operators, measurements } =
      getWellSDKClientV2().wells;
    return { fields, blocks, operators, measurements };
  }

  return {
    fields: () =>
      getWellSDKClientV3()
        .summaries.fields()
        .then(mapSummaryCountsToStringArray),
    blocks: () =>
      getWellSDKClientV3()
        .summaries.blocks()
        .then(mapSummaryCountsToStringArray),
    operators: () =>
      getWellSDKClientV3()
        .summaries.operators()
        .then(mapSummaryCountsToStringArray),
    // To be fixed very soon and will be fetched using the `Summaries API`.
    measurements: () =>
      getWellSDKClientV3()
        .measurements.list({})
        .then(getMeasurementsFromDepthMeasurementItems),
  };
};

export const getSources = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3().sources.list().then(mapV3ToV2SourceItems)
    : getWellSDKClientV2().wells.sources();
};

export const getWellsWaterDepthLimits = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.waterDepthLimits()
        .then(mapV3ToV2WellsWaterDepthLimits)
    : getWellSDKClientV2()
        .wells.limits()
        .then((response) => response.waterDepth);
};

export const getWellsSpudDateLimits = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.spudDateLimits()
        .then(mapV3ToV2SpudDateLimits)
    : getWellSDKClientV2()
        .wells.limits()
        .then((response) => response.spudDate);
};

export const getNPTDurationLimits = () => {
  return enableWellSDKV3
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
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.nptCodes()
        .then(mapSummaryCountsToStringArray)
    : getWellSDKClientV2().events.nptCodes();
};

export const getNPTDetailCodes = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.nptDetailCodes()
        .then(mapSummaryCountsToStringArray)
    : getWellSDKClientV2().events.nptDetailCodes();
};

export const getNDSRiskTypes = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .summaries.ndsRiskTypes()
        .then(mapSummaryCountsToStringArray)
    : getWellSDKClientV2().events.ndsRiskTypes();
};

export const getWellById = (wellId: number) => {
  return enableWellSDKV3
    ? getWellByMatchingId(wellId).then(mapV3ToV2Well)
    : getWellSDKClientV2().wells.getById(wellId);
};

export const getWellItemsByFilter = (wellFilter: WellFilter) => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .wells.list(mapWellFilterToWellFilterRequest(wellFilter))
        .then(mapV3ToV2WellItems)
    : getWellSDKClientV2().wells.filter(wellFilter);
};

export const getWellboresFromWells = (wellIds: number[]) => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .wellbores.retrieveMultipleByWells(
          toIdentifierItems(wellIds.map(toIdentifier))
        )
        .then(extractWellboresFromWells)
        .then((wellbores) => wellbores.map(mapV3ToV2Wellbore))
    : getWellSDKClientV2().wellbores.getFromWells(wellIds);
};

export const getNPTItems = (
  filter: NPTFilter,
  cursor?: string,
  limit?: number
) => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .npt.list({
          filter: mapV2toV3NPTFilter(filter),
          cursor,
          limit,
        })
        .then(mapV3ToV2NPTItems)
    : getWellSDKClientV2().events.listNPT(filter, cursor, limit);
};
