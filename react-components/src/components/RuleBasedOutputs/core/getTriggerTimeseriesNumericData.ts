/*!
 * Copyright 2025 Cognite AS
 */
import { type TriggerTypeData, type TimeseriesRuleTrigger } from '../types';

export const getTriggerTimeseriesNumericData = (
  triggerTypeData: TriggerTypeData,
  trigger: TimeseriesRuleTrigger
): number | undefined => {
  if (trigger.type !== 'timeseries') return;
  if (triggerTypeData.type !== 'timeseries') return;

  const timeseriesWithDatapoints = triggerTypeData.timeseries.timeseriesWithDatapoints;

  const dataFound = timeseriesWithDatapoints.find((item) => item.externalId === trigger.externalId);

  const datapoint = dataFound?.datapoints[dataFound?.datapoints.length - 1]?.value;

  return Number(datapoint);
};
