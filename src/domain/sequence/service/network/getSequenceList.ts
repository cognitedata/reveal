import {
  CogniteClient,
  CursorResponse,
  Sequence,
  SequenceFilter,
} from '@cognite/sdk';
import { InternalSequenceSortBy, normalizeSequence } from 'domain/sequence';

export const getSequenceList = (
  sdk: CogniteClient,
  {
    filter,
    cursor,
    limit,
    sort,
  }: {
    filter?: Required<SequenceFilter>['filter'];
    cursor?: string;
    limit?: number;
    sort?: InternalSequenceSortBy[];
  }
) => {
  return sdk
    .post<CursorResponse<Sequence[]>>(
      `/api/v1/projects/${sdk.project}/sequences/list`,
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
        items: normalizeSequence(data.items),
        nextCursor: data.nextCursor,
      };
    });
};
