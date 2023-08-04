import compact from 'lodash/compact';
import head from 'lodash/head';

import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  IdEither,
} from '@cognite/sdk';

import { convertIdEither } from '../utils';

type Payload = {
  resourceId: IdEither;
  linkedResourceIds?: IdEither[];
};

export const getLinkedDocumentsCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { resourceId, linkedResourceIds } = payload;

  const linkedResourceIdsFilter = linkedResourceIds
    ? {
        or: linkedResourceIds.map((linkedResourceId) =>
          convertIdEither('equals', linkedResourceId)
        ),
      }
    : undefined;

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
              convertIdEither('inAssetSubtree', resourceId),
              linkedResourceIdsFilter,
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
