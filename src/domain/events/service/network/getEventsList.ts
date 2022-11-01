import { CogniteClient, CogniteEvent, CursorResponse } from '@cognite/sdk';
import { InternalSortBy } from 'domain/types';
import { normalizeEvents } from '../transformers/normalize';

export const getEventsList = (
  sdk: CogniteClient,
  {
    advancedFilter,
    cursor,
    limit,
    sort,
  }: {
    advancedFilter?: any;
    cursor?: string;
    limit?: number;
    sort?: InternalSortBy[];
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
          sort,
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
