import head from 'lodash/head';

import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  IdEither,
} from '@cognite/sdk';

import { convertIdEither } from '../utils';

type Payload = {
  resourceIds: IdEither[];
};

export const getValidDocumentsCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { resourceIds } = payload;

  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/documents/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter: {
            or: resourceIds.map((resourceId) =>
              convertIdEither('equals', resourceId)
            ),
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
