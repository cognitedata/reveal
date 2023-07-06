import { CogniteClient, IdEither } from '@cognite/sdk';

import { getDocumentByIdFilter } from '../utils';

type Payload = {
  resourceId: IdEither;
};

export const getDocumentAssetIds = (sdk: CogniteClient, payload: Payload) => {
  const { resourceId } = payload;

  return sdk.documents
    .list({
      filter: getDocumentByIdFilter(resourceId),
    })
    .then(({ items }) => {
      return items[0].assetIds || [];
    });
};
