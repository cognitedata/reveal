import omit from 'lodash/omit';

import {
  CogniteClient,
  CursorResponse,
  DatapointAggregates,
} from '@cognite/sdk';

import {
  TimeseriesSingleAggregate,
  TimeseriesSingleAggregateQuery,
} from '../types';

export const getTimeseriesSingleAggregate = (
  sdk: CogniteClient,
  query: TimeseriesSingleAggregateQuery
): Promise<TimeseriesSingleAggregate> => {
  return sdk
    .post<CursorResponse<DatapointAggregates[]>>(
      `/api/v1/projects/${sdk.project}/timeseries/data/aggregate/single`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: query,
      }
    )
    .then(({ data }) => {
      const { datapoints, ...rest } = data.items[0];

      return {
        ...rest,
        data: omit(datapoints[0], 'timestamp'),
      };
    });
};
