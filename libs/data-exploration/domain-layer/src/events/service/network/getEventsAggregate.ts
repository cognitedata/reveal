import { AggregateResponse, CogniteClient, CursorResponse } from '@cognite/sdk';
import { EventsAggregateRequestPayload } from '@data-exploration-lib/domain-layer';

export const getEventsAggregate = <ResponseType = AggregateResponse>(
  sdk: CogniteClient,
  payload?: EventsAggregateRequestPayload
) => {
  return sdk
    .post<CursorResponse<ResponseType[]>>(
      `/api/v1/projects/${sdk.project}/events/aggregate`,
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
