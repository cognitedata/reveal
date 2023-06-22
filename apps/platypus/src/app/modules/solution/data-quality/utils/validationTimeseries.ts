import { toNumber } from 'lodash';

import { Datapoints } from '@cognite/sdk/dist/src';

export enum TimeSeriesType {
  SCORE = 'score',
  TOTAL_ITEMS_COUNT = 'totalItemsCount',
}

/** Compute an id for a data source timeseries or rule timeseries. */
export const getTimeSeriesId = (
  type: TimeSeriesType,
  dataSourceId: string,
  ruleId?: string
) => (ruleId ? `${dataSourceId}_${ruleId}_${type}` : `${dataSourceId}_${type}`);

/** Return an object fit for a timeseries request, containing the id of the timeseries and the 'before' property. */
export const getTimeSeriesItemRequest = (
  type: TimeSeriesType,
  dataSourceId: string,
  ruleId?: string
) => ({
  externalId: getTimeSeriesId(type, dataSourceId, ruleId),
  before: 'now',
});

/** Get the latest data point value for a specific timeseries. */
export const getLastDatapointValue = (
  tsDatapoints: Datapoints[],
  timeSeriesId: string
): string | number | undefined =>
  tsDatapoints.find((ts) => ts.externalId === timeSeriesId)?.datapoints[0]
    ?.value;

/** Format the validity score from a datapoint */
export const getScoreValue = (value?: number | string) =>
  value !== undefined ? `${Math.round(toNumber(value) * 100)}%` : value;

/** Check if a list of timeseries doesn't have any datapoints */
export const emptyDatapoints = (tsDatapoints: Datapoints[]) =>
  tsDatapoints.every((ts) => ts.datapoints.length === 0);
