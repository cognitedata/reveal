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
  resourceIds: IdEither[];
};

export const getValidResourcesCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { resourceType, resourceIds } = payload;

  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/${resourceType}/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          advancedFilter: resourceIds
            ? {
                or: resourceIds.map((resourceId) =>
                  convertIdEither('equals', resourceId)
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
