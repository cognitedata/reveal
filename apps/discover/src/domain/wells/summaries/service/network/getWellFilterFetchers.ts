import {
  getWellSDKClient,
  isWellSDKAuthenticated,
} from 'domain/wells/utils/authenticate';

import { processSpudDateLimits } from '../../internal/transformers/processSpudDateLimits';
import { getNamesFromSourceItems } from '../utils/getNamesFromSourceItems';
import { getPropertiesFromSummaryCounts } from '../utils/getPropertiesFromSummaryCounts';
import { getTypesFromMeasurementTypes } from '../utils/getTypesFromMeasurementTypes';

export const getWellFilterFetchers = () => {
  if (!isWellSDKAuthenticated()) {
    return null;
  }

  return {
    sources: () =>
      getWellSDKClient().sources.list().then(getNamesFromSourceItems),

    fields: () =>
      getWellSDKClient()
        .summaries.fields()
        .then(getPropertiesFromSummaryCounts),

    blocks: () =>
      getWellSDKClient()
        .summaries.blocks()
        .then(getPropertiesFromSummaryCounts),

    operators: () =>
      getWellSDKClient()
        .summaries.operators()
        .then(getPropertiesFromSummaryCounts),

    welltypes: () =>
      getWellSDKClient()
        .summaries.welltypes()
        .then(getPropertiesFromSummaryCounts),

    measurements: () =>
      getWellSDKClient()
        .summaries.measurementTypes()
        .then(getTypesFromMeasurementTypes),

    regions: async () =>
      getWellSDKClient()
        .summaries.regions()
        .then(getPropertiesFromSummaryCounts),

    mdLimits: () =>
      getWellSDKClient().summaries.trajectoriesMeasuredDepthLimits(),

    tvdLimits: () =>
      getWellSDKClient().summaries.trajectoriesTrueVerticalDepthLimits(),

    kbLimits: () => getWellSDKClient().summaries.datumLimits(),

    dogLegSeverityLimits: () =>
      getWellSDKClient().summaries.trajectoriesDoglegSeverityLimits(),

    waterDepthLimits: () => getWellSDKClient().summaries.waterDepthLimits(),

    spudDateLimits: () =>
      getWellSDKClient().summaries.spudDateLimits().then(processSpudDateLimits),

    nptCodes: () =>
      getWellSDKClient()
        .summaries.nptCodes()
        .then(getPropertiesFromSummaryCounts),

    nptCodeDetails: () =>
      getWellSDKClient()
        .summaries.nptCodeDetails()
        .then(getPropertiesFromSummaryCounts),

    nptDurations: () =>
      getWellSDKClient()
        .summaries.nptDurations()
        .then((duration) => [
          Math.ceil(Number(duration.min)),
          Math.floor(Number(duration.max)),
        ]),

    ndsRiskTypes: () =>
      getWellSDKClient()
        .summaries.ndsRiskTypes()
        .then(getPropertiesFromSummaryCounts),
  };
};
