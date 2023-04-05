import {
  CogniteClient,
  DatapointAggregate,
  DatapointAggregates,
} from '@cognite/sdk';

import head from 'lodash/head';

import { DatapointAggregatesQuery } from '../types';

export const getTimeseriesDatapointAggregates = (
  sdk: CogniteClient,
  query: DatapointAggregatesQuery
): Promise<DatapointAggregate[]> => {
  const { timeseriesId, ...rest } = query;

  return sdk.datapoints
    .retrieve({
      items: [{ id: timeseriesId }],
      ...rest,
    })
    .then((items) => {
      return head(items as DatapointAggregates[])?.datapoints || [];
    });
};
