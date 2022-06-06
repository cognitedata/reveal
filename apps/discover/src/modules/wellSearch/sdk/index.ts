import {
  authenticateWellSDK,
  getWellSDKClient,
} from 'domain/wells/utils/authenticate';

import {
  mapSummaryCountsToStringArray,
  mapV2toV3NPTFilter,
  mapV3ToV2NPTItems,
  mapV3ToV2SourceItems,
  mapV3ToV2SpudDateLimits,
  mapV3ToV2WellsWaterDepthLimits,
  NPTFilterV2WithV3WellboreIds,
} from './utils';

export { authenticateWellSDK };

export const isWellSDKAuthenticated = () => {
  return !!getWellSDKClient()?.isLoggedIn;
};

export const getWellFilterFetchers = () => {
  if (!isWellSDKAuthenticated()) return null;

  return {
    fields: () =>
      // unused now, take from discover-api groups instead
      getWellSDKClient().summaries.fields().then(mapSummaryCountsToStringArray),
    blocks: () =>
      // unused now, take from discover-api groups instead
      getWellSDKClient().summaries.blocks().then(mapSummaryCountsToStringArray),
    operators: () =>
      getWellSDKClient()
        .summaries.operators()
        .then(mapSummaryCountsToStringArray),
    welltypes: () =>
      getWellSDKClient()
        .summaries.welltypes()
        .then(mapSummaryCountsToStringArray),
    measurements: () =>
      getWellSDKClient()
        .summaries.measurementTypes()
        .then((results) => {
          return results.map((result) => result.type);
        }),
    regions: async () => {
      // unused now, take from discover-api groups instead
      const regions = await getWellSDKClient().summaries.regions();
      return mapSummaryCountsToStringArray(regions);
    },
    mdLimits: () =>
      getWellSDKClient().summaries.trajectoriesMeasuredDepthLimits(),
    tvdLimits: () =>
      getWellSDKClient().summaries.trajectoriesTrueVerticalDepthLimits(),
    kbLimits: () => getWellSDKClient().summaries.datumLimits(),
    dogLegSeverityLimits: () =>
      getWellSDKClient().summaries.trajectoriesDoglegSeverityLimits(),
    inclinationAngleLimits: () =>
      getWellSDKClient().summaries.trajectoriesDoglegSeverityLimits(),
  };
};

export const getSources = () => {
  return getWellSDKClient().sources.list().then(mapV3ToV2SourceItems);
};

export const getWellsWaterDepthLimits = () => {
  return getWellSDKClient()
    .summaries.waterDepthLimits()
    .then(mapV3ToV2WellsWaterDepthLimits);
};

export const getWellsSpudDateLimits = () => {
  return getWellSDKClient()
    .summaries.spudDateLimits()
    .then(mapV3ToV2SpudDateLimits);
};

export const getNPTDurationLimits = () => {
  return getWellSDKClient()
    .summaries.nptDurations()
    .then((response) => [
      Math.ceil(Number(response.min)),
      Math.floor(Number(response.max)),
    ]);
};

export const getNPTCodes = () => {
  return getWellSDKClient()
    .summaries.nptCodes()
    .then(mapSummaryCountsToStringArray);
};

export const getNPTDetailCodes = () => {
  return getWellSDKClient()
    .summaries.nptDetailCodes()
    .then(mapSummaryCountsToStringArray);
};

export const getNDSRiskTypes = () => {
  return getWellSDKClient()
    .summaries.ndsRiskTypes()
    .then(mapSummaryCountsToStringArray);
};

export const getNPTItems = ({
  filter,
  cursor,
  limit,
}: {
  filter: NPTFilterV2WithV3WellboreIds;
  cursor?: string;
  limit?: number;
}) => {
  return getWellSDKClient()
    .npt.list({
      filter: mapV2toV3NPTFilter(filter),
      cursor,
      limit,
    })
    .then(mapV3ToV2NPTItems);
};
