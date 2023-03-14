import { AggregateResponse, CogniteClient, CursorResponse } from '@cognite/sdk';
import { SequencesAggregateRequestPayload } from '@data-exploration-lib/domain-layer';

export const getSequencesAggregate = <ResponseType = AggregateResponse>(
  sdk: CogniteClient,
  payload?: SequencesAggregateRequestPayload
) => {
  return sdk
    .post<CursorResponse<ResponseType[]>>(
      `/api/v1/projects/${sdk.project}/sequences/aggregate`,
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
