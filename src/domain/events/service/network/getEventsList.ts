import { CogniteClient, CogniteEvent, CursorResponse } from '@cognite/sdk';
import { normalizeEvents } from '../transformers/normalize';

export const getEventsList = (
  sdk: CogniteClient,
  {
    advancedFilter,
    cursor,
    limit,
  }: {
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
          limit: limit ?? 1000,
          cursor,
          advancedFilter,
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
