import { AggregateResponse, CogniteClient, CursorResponse } from '@cognite/sdk';

import { TimeseriesAggregateRequestPayload } from '../types';

export const getTimeseriesAggregate = <ResponseType = AggregateResponse>(
  sdk: CogniteClient,
  payload: TimeseriesAggregateRequestPayload
) => {
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
