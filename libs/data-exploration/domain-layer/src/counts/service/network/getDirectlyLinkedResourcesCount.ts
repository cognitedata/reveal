import head from 'lodash/head';

import { AggregateResponse, CogniteClient, CursorResponse } from '@cognite/sdk';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

type Payload = {
  resourceType: SdkResourceType;
  assetIds: number[];
};

export const getDirectlyLinkedResourcesCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { resourceType, assetIds } = payload;

  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/${resourceType}/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter: {
            assetIds,
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
