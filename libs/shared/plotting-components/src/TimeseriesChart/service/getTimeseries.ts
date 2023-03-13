import {
  CogniteClient,
  DatapointAggregate,
  DatapointAggregates,
} from '@cognite/sdk';

import head from 'lodash/head';

import { TimeseriesQuery } from '../types';
import { calculateGranularity } from '../utils/calculateGranularity';

export const getTimeseries = (
  sdk: CogniteClient,
  { timeseriesId, start, end, limit = 20 }: TimeseriesQuery
): Promise<DatapointAggregate[]> => {
  return sdk.datapoints
    .retrieve({
      items: [{ id: timeseriesId }],
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
    });
};
