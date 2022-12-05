import {
  CogniteClient,
  DocumentsAggregateAllUniqueValuesRequest,
} from '@cognite/sdk';

export const getDocumentAggregates = (
  aggregates: Omit<DocumentsAggregateAllUniqueValuesRequest, 'aggregate'>,
  sdk: CogniteClient
) => {
  return sdk.documents.aggregate
    .allUniqueValues(aggregates)
    .autoPagingToArray({ limit: Infinity });
};
