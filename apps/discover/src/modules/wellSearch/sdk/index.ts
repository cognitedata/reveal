import isUndefined from 'lodash/isUndefined';

import { getTenantInfo } from '@cognite/react-container';
import { Cluster, WellFilter, NPTFilter } from '@cognite/sdk-wells-v2';

import { fetcher } from 'hooks/useTenantConfig';
import { TenantConfig } from 'tenants/types';

import {
  extractWellboresFromWells,
  mapStringItemsToStringArray,
  mapV1toV2NPTFilter,
  mapV2ToV1NPTItems,
  mapV2ToV1SourceItems,
  mapV2ToV1SpudDateLimits,
  mapV2ToV1Well,
  mapV2ToV1Wellbore,
  mapV2ToV1WellItems,
  mapV2ToV1WellsWaterDepthLimits,
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

export const getWellSDKClient = () => {
  if (!isWellSDKAuthenticated()) return null;
  return enableWellSDKV3 ? getWellSDKClientV3() : getWellSDKClientV2();
};

export const getWellsAPI = () => {
  return getWellSDKClient()?.wells;
};

export const getSources = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3().sources.list().then(mapV2ToV1SourceItems)
    : getWellSDKClientV2().wells.sources();
};

export const getWellsWaterDepthLimits = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .wells.waterDepthLimits()
        .then(mapV2ToV1WellsWaterDepthLimits)
    : getWellSDKClientV2()
        .wells.limits()
        .then((response) => response.waterDepth);
};

export const getWellsSpudDateLimits = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3().wells.spudDateLimits().then(mapV2ToV1SpudDateLimits)
    : getWellSDKClientV2()
        .wells.limits()
        .then((response) => response.spudDate);
};

export const getNPTDurationLimits = () => {
  return enableWellSDKV3
    ? Promise.resolve([]) // This feature is not added in the new wells SDK yet and to be added soon.
    : getWellSDKClientV2()
        .wells.limits()
        .then((response) => [
          Math.ceil(Number(response.nptDuration.min)),
          Math.floor(Number(response.nptDuration.max)),
        ]);
};

export const getNPTCodes = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3().npt.codes().then(mapStringItemsToStringArray)
    : getWellSDKClientV2().events.nptCodes();
};

export const getNPTDetailCodes = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3().npt.detailCodes().then(mapStringItemsToStringArray)
    : getWellSDKClientV2().events.nptDetailCodes();
};

export const getNDSRiskTypes = () => {
  return enableWellSDKV3
    ? getWellSDKClientV3().nds.riskTypes().then(mapStringItemsToStringArray)
    : getWellSDKClientV2().events.ndsRiskTypes();
};

export const getWellById = (wellId: number) => {
  return enableWellSDKV3
    ? getWellByMatchingId(wellId).then(mapV2ToV1Well)
    : getWellSDKClientV2().wells.getById(wellId);
};

export const getWellItemssByFilter = (wellFilter: WellFilter) => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .wells.list(mapWellFilterToWellFilterRequest(wellFilter))
        .then(mapV2ToV1WellItems)
    : getWellSDKClientV2().wells.filter(wellFilter);
};

export const getWellboresFromWells = (wellIds: number[]) => {
  return enableWellSDKV3
    ? getWellSDKClientV3()
        .wellbores.retrieveMultipleByWells(
          toIdentifierItems(wellIds.map(toIdentifier))
        )
        .then(extractWellboresFromWells)
        .then((wellbores) => wellbores.map(mapV2ToV1Wellbore))
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
          filter: mapV1toV2NPTFilter(filter),
          cursor,
          limit,
        })
        .then(mapV2ToV1NPTItems)
    : getWellSDKClientV2().events.listNPT(filter, cursor, limit);
};
