import head from 'lodash/head';

import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  IdEither,
} from '@cognite/sdk';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { convertIdEither } from '../utils';

type Payload = {
  resourceType: SdkResourceType;
  resourceId: IdEither;
  linkedResourceIds?: IdEither[];
};

export const getLinkedResourcesCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { resourceId, resourceType, linkedResourceIds } = payload;

  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/${resourceType}/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter: {
            assetSubtreeIds: [resourceId],
          },
          advancedFilter: linkedResourceIds
            ? {
                or: linkedResourceIds.map((linkedResourceId) =>
                  convertIdEither('equals', linkedResourceId)
                ),
              }
            : undefined,
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
