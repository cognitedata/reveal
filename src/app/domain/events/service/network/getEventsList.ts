import { CogniteClient, CogniteEvent, CursorResponse } from '@cognite/sdk';
import { normalizeEvents } from 'app/domain/events/service/transformers/normalize';

export const getEventsList = (
  sdk: CogniteClient,
  data: {
    advancedFilter?: any;
    cursor?: string;
    limit?: number;
  }
) => {
  return sdk
    .post<CursorResponse<CogniteEvent[]>>(
      `/api/v1/projects/${sdk.project}/events/list`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          limit: 1000,
          ...data,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: normalizeEvents(data.items),
        nextCursor: data.nextCursor,
      };
    });
};
