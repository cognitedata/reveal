import compact from 'lodash/compact';
import head from 'lodash/head';

import { AggregateResponse, CogniteClient, CursorResponse } from '@cognite/sdk';

type Payload = {
  assetIds: number[];
};

export const getDirectlyLinkedDocumentsCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { assetIds } = payload;

  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/documents/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter: {
            and: compact([
              {
                containsAny: {
                  property: ['sourceFile', 'assetIds'],
                  values: assetIds,
                },
              },
            ]),
          },
        },
      }
    )
    .then(({ data }) => {
      return head(data.items)?.count || 0;
    })
    .catch(() => {
      return 0;
    });
};
