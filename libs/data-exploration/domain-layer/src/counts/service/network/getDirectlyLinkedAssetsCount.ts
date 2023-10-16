import head from 'lodash/head';

import { AggregateResponse, CogniteClient, CursorResponse } from '@cognite/sdk';

type Payload = {
  assetIds: number[];
};

export const getDirectlyLinkedAssetsCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { assetIds } = payload;

  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/assets/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          advancedFilter: {
            or: assetIds.map((assetId) => ({
              equals: {
                property: ['parentId'],
                value: assetId,
              },
            })),
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
