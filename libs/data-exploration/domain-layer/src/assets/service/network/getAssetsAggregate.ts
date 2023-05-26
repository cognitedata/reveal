import { AggregateResponse, CogniteClient, CursorResponse } from '@cognite/sdk';

import { AssetsAggregateRequestPayload } from '../types';

export const getAssetsAggregate = <ResponseType = AggregateResponse>(
  sdk: CogniteClient,
  payload?: AssetsAggregateRequestPayload
) => {
  return sdk
    .post<CursorResponse<ResponseType[]>>(
      `/api/v1/projects/${sdk.project}/assets/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
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
