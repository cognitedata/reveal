import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import {
  CogniteExternalId,
  CogniteInternalId,
  DocumentFilter,
  IdEither,
} from '@cognite/sdk';

export const getDocumentsAggregateFilter = (
  resourceId: IdEither
): DocumentFilter | undefined => {
  const externalId: CogniteExternalId | undefined = get(
    resourceId,
    'externalId'
  );

  if (!isUndefined(externalId)) {
    return {
      inAssetSubtree: {
        property: ['assetExternalIds'],
        values: [externalId],
      },
    };
  }

  const internalId: CogniteInternalId | undefined = get(resourceId, 'id');

  if (!isUndefined(internalId)) {
    return {
      inAssetSubtree: {
        property: ['assetIds'],
        values: [internalId],
      },
    };
  }

  return undefined;
};
