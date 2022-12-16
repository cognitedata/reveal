import {
  CogniteClient,
  CursorResponse,
  TimeseriesFilter,
  Timeseries,
} from '@cognite/sdk';
import { AdvancedFilter } from '@data-exploration-components/domain/builders';
import {
  normalizeTimeseries,
  TimeseriesProperties,
} from '@data-exploration-components/domain/timeseries';
import { InternalSortBy } from '@data-exploration-components/domain/types';

export const getTimeseriesList = (
  sdk: CogniteClient,
  {
    advancedFilter,
    filter,
    cursor,
    limit,
    sort,
  }: {
    advancedFilter?: AdvancedFilter<TimeseriesProperties>;
    filter?: TimeseriesFilter;
    cursor?: string;
    limit?: number;
    sort?: InternalSortBy[];
  }
) => {
  return sdk
    .post<CursorResponse<Timeseries[]>>(
      `/api/v1/projects/${sdk.project}/timeseries/list`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          limit: limit ?? 1000,
          cursor,
          filter,
          advancedFilter,
          sort,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: normalizeTimeseries(data.items),
        nextCursor: data.nextCursor,
      };
    });
};
