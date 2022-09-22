import { DocumentSearchRequest, CogniteClient } from '@cognite/sdk';

export const search = (query: DocumentSearchRequest, sdk: CogniteClient) => {
  return sdk.documents.search(query);
};
