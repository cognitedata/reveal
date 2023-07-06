import { CogniteClient, IdEither } from '@cognite/sdk';

import { getDocumentsAggregateFilter } from '../utils';

type Payload = {
  resourceId: IdEither;
};

export const getLinkedDocumentsCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { resourceId } = payload;

  return sdk.documents.aggregate.count({
    filter: getDocumentsAggregateFilter(resourceId),
  });
};
