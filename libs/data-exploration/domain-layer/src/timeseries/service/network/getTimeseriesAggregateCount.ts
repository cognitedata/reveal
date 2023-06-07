import isEmpty from 'lodash/isEmpty';

import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  TimeseriesFilter,
} from '@cognite/sdk';

import { AdvancedFilter } from '../../../builders';
import { TimeseriesProperties } from '../../internal';

export const getTimeseriesAggregateCount = (
  sdk: CogniteClient,
  {
    filter,
    advancedFilter,
  }: {
    filter?: TimeseriesFilter;
    advancedFilter?: AdvancedFilter<TimeseriesProperties>;
  }
) => {
  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/timeseries/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter,
          advancedFilter,
          aggregate: 'count',
        },
      }
    )
    .then(({ data }) => {
      return { count: !isEmpty(data.items) ? data.items[0].count : 0 };
    });
};
