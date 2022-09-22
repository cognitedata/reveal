import {
  CogniteClient,
  DocumentsAggregateAllUniqueValuesRequest,
  DocumentsAggregateCountRequest,
} from '@cognite/sdk';

export const getDocumentAggregates = (
  aggregates: Omit<DocumentsAggregateAllUniqueValuesRequest, 'aggregate'>,
  sdk: CogniteClient
) => {
  return sdk.documents.aggregate
    .allUniqueValues(aggregates)
    .autoPagingToArray({ limit: Infinity });
};

export const getDocumentAggregateCount = (
  aggregates: Omit<DocumentsAggregateCountRequest, 'aggregate'>,
  sdk: CogniteClient
) => {
  return sdk.documents.aggregate.count(aggregates);
};
