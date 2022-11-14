import {
  CogniteClient,
  CursorResponse,
  TimeseriesFilter,
  Timeseries,
} from '@cognite/sdk';
import { AdvancedFilter } from 'domain/builders';
import {
  InternalTimeseriesSortBy,
  normalizeTimeseries,
  TimeseriesProperties,
} from 'domain/timeseries';

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
    sort?: InternalTimeseriesSortBy[];
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
