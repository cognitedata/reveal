import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  TimeseriesFilter,
} from '@cognite/sdk';

export const getTimeseriesAggregate = <ResponseType = AggregateResponse>(
  sdk: CogniteClient,
  query?: string,
  filter?: TimeseriesFilter
) => {
  const payload = {} as any;

  if (filter) {
    payload['filter'] = filter;
  }

  if (query) {
    payload['advancedFilter'] = {
      and: [
        {
          search: {
            property: ['name'],
            value: query,
          },
        },
      ],
    };
  }

  return sdk
    .post<CursorResponse<ResponseType[]>>(
      `/api/v1/projects/${sdk.project}/timeseries/aggregate`,
      {
        headers: {
          'cdf-version': 'beta',
        },
        data: payload,
      }
    )
    .then(({ data }) => {
      return {
        items: data.items,
      };
    });
};
