import { CogniteClient, DocumentSearchRequest } from '@cognite/sdk/dist/src';

export const search = (query: DocumentSearchRequest, sdk: CogniteClient) => {
  return sdk.documents.search(query);
};
