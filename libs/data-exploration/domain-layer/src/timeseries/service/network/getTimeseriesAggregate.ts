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

export const getTimeseriesAggregate = (
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
        },
      }
    )
    .then(({ data }) => {
      return {
        items: data.items,
      };
    });
};
