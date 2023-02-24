import { CogniteClient, CursorResponse } from '@cognite/sdk';
import { AggregateResponse } from '@cognite/sdk/dist/src/types';
import { DocumentsAggregateRequestPayload } from '../types';

export const getDocumentsAggregate = async <ResponseType = AggregateResponse>(
  sdk: CogniteClient,
  payload?: DocumentsAggregateRequestPayload
) => {
  let cursor = null;
  const aggregates: any[] = [];

  while (cursor !== undefined) {
    // @ts-ignore // don't know why the type here is wrong, should be fixed when we migrate to sdk usage
    const { data } = await sdk.post<CursorResponse<ResponseType[]>>(
      `/api/v1/projects/${sdk.project}/documents/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          ...payload,
          cursor,
          limit: 10000,
        },
      }
    );

    aggregates.concat(data.items);
    cursor = data.nextCursor;
  }

  return Promise.resolve({ items: aggregates });
};
