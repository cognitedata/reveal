import { DateFormat } from '@platypus-core/boundaries/types';
import { toNumber } from 'lodash';
import { Datum } from 'plotly.js';

import {
  DatapointAggregates,
  Datapoints,
  Timestamp,
} from '@cognite/sdk/dist/src';

import { DateUtilsImpl } from '../../../../utils/data';

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

/** Return an object fit for a timeseries request, containing the id of the timeseries. */
export const getTimeSeriesItemRequest = (
  type: TimeSeriesType,
  dataSourceId: string,
  ruleId?: string
) => ({
  externalId: getTimeSeriesId(type, dataSourceId, ruleId),
});

/** Get the latest data point value for a specific timeseries. */
export const getLastDatapointValue = (
  tsDatapoints: Datapoints[],
  timeSeriesId: string
): string | number | undefined =>
  tsDatapoints.find((ts) => ts.externalId === timeSeriesId)?.datapoints[0]
    ?.value;

export const getDatapointsById = (
  datapoints: Datapoints[],
  timeSeriesId: string
) => datapoints.find((dp) => dp.externalId === timeSeriesId);

export const getScore = (value?: number | string) =>
  value !== undefined ? parseFloat((toNumber(value) * 100).toFixed(2)) : value;

/** Format the validity score from a datapoint */
export const getScoreValue = (value?: number | string) =>
  value !== undefined ? `${getScore(value)}%` : value;

/** Check if a list of timeseries doesn't have any datapoints */
export const emptyDatapoints = (tsDatapoints: Datapoints[]) =>
  tsDatapoints.every((ts) => ts.datapoints.length === 0);

/**
 * The time series response has the datapoints order starting with the oldest timestamps.
 * This function reverts the order of the datapoints, so the first datapoint will be the latest one.
 */
export const formatTimeriesResponse = (
  tsDatapoints: Datapoints[] | DatapointAggregates[]
) => {
  const data = tsDatapoints as Datapoints[];
  const formattedData = data.map((ts) => ({
    ...ts,
    datapoints: ts.datapoints.reverse(),
  }));

  return formattedData as Datapoints[];
};

/** Format the date point used in the graphs. */
export const formatDateDatum = (datum: Datum) => {
  const date = (datum as Timestamp).toString();
  const dateUtils = new DateUtilsImpl();
  const formattedDate = dateUtils.format(
    date,
    DateFormat.DISPLAY_DATETIME_FORMAT
  );

  return formattedDate;
};
