import {
  CogniteClient,
  CursorResponse,
  TimeseriesFilter,
  Timeseries,
} from '@cognite/sdk';
import {
  InternalTimeseriesSortBy,
  normalizeTimeseries,
} from 'domain/timeseries';

export const getTimeseriesList = (
  sdk: CogniteClient,
  {
    filter,
    cursor,
    limit,
    sort,
  }: {
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
          // advancedFilter,
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
