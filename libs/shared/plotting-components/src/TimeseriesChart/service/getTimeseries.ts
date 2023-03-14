import {
  CogniteClient,
  DatapointAggregate,
  DatapointAggregates,
} from '@cognite/sdk';

import head from 'lodash/head';

import { DEFAULT_DATAPOINTS_LIMIT } from '../constants';
import { TimeseriesQuery } from '../types';
import { calculateGranularity } from '../utils/calculateGranularity';

export const getTimeseries = (
  sdk: CogniteClient,
  {
    timeseriesId,
    start,
    end,
    limit = DEFAULT_DATAPOINTS_LIMIT,
  }: TimeseriesQuery
): Promise<DatapointAggregate[]> => {
  return sdk.datapoints
    .retrieve({
      items: [{ id: timeseriesId }],
      start,
      end,
      granularity: calculateGranularity(
        [start?.valueOf(), end?.valueOf()] as number[],
        limit
      ),
      aggregates: ['count', 'min', 'max', 'average'],
    })
    .then((items) => {
      const datapoints = head(items as DatapointAggregates[])?.datapoints;

      if (!datapoints) {
        return [];
      }

      return datapoints;
    })
    .catch(() => {
      return [];
    });
};
