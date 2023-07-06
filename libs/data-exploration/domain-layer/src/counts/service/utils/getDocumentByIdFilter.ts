import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import {
  CogniteExternalId,
  CogniteInternalId,
  DocumentFilter,
  IdEither,
} from '@cognite/sdk';

export const getDocumentByIdFilter = (
  resourceId: IdEither
): DocumentFilter | undefined => {
  const externalId: CogniteExternalId | undefined = get(
    resourceId,
    'externalId'
  );

  if (!isUndefined(externalId)) {
    return {
      equals: {
        property: ['externalId'],
        value: externalId,
      },
    };
  }

  const internalId: CogniteInternalId | undefined = get(resourceId, 'id');

  if (!isUndefined(internalId)) {
    return {
      equals: {
        property: ['id'],
        value: internalId,
      },
    };
  }

  return undefined;
};
