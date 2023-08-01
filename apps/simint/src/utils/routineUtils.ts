import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

export const getTargetTimeseriesByPrefix = (
  timeSeriesPrefix: string,
  values: UserDefined
) =>
  timeSeriesPrefix === 'inputTimeSeries'
    ? values.inputTimeSeries
    : values.outputTimeSeries;
