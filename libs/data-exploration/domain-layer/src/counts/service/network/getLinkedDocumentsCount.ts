import { CogniteClient } from '@cognite/sdk';

type Payload = {
  resourceId: number;
};

export const getLinkedDocumentsCount = (
  sdk: CogniteClient,
  payload: Payload
) => {
  const { resourceId } = payload;

  return sdk.documents.aggregate.count({
    filter: {
      inAssetSubtree: {
        property: ['assetIds'],
        values: [resourceId],
      },
    },
  });
};
