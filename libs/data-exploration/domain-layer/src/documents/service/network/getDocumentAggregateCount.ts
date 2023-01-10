import { CogniteClient, DocumentsAggregateCountRequest } from '@cognite/sdk';

export const getDocumentAggregateCount = (
  aggregates: Omit<DocumentsAggregateCountRequest, 'aggregate'>,
  sdk: CogniteClient
) => {
  return sdk.documents.aggregate.count(aggregates);
};
