import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  TimeseriesFilter,
} from '@cognite/sdk';

import {
  AdvancedFilter,
  TimeseriesProperties,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';

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
