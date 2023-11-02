import {
  CogniteClient,
  CursorResponse,
  TimeseriesFilter,
  Timeseries,
} from '@cognite/sdk';

import { ACDMAdvancedFilter } from '../../../builders/ACDMFilterBuilder';

export const getTimeseriesList = (
  sdk: CogniteClient,
  {
    advancedFilter,
    filter,
    cursor,
    limit,
  }: {
    advancedFilter?: ACDMAdvancedFilter<Timeseries>;
    filter?: TimeseriesFilter;
    cursor?: string;
    limit?: number;
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
        },
      }
    )
    .then(({ data }) => {
      return {
        items: data.items,
        nextCursor: data.nextCursor,
      };
    });
};
