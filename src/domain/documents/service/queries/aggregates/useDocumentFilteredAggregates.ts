import { useSDK } from '@cognite/sdk-provider';
import { DocumentsAggregateAllUniqueValuesRequest } from '@cognite/sdk/dist/src';
import { queryKeys } from 'domain/queryKeys';
import { InternalDocumentFilter } from 'domain/documents';
import isEmpty from 'lodash/isEmpty';
import { useQuery } from 'react-query';
import { getDocumentAggregates } from '../../network/getDocumentAggregates';

export const useDocumentFilteredAggregates = (
  aggregates: DocumentsAggregateAllUniqueValuesRequest['properties'],
  filters?: InternalDocumentFilter,
  query?: string
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsFilteredAggregates(filters, aggregates),
    () => {
      return getDocumentAggregates(
        {
          properties: aggregates,
          limit: 10000,
          ...filters,
          ...(query ? { search: { query } } : {}),
        },
        sdk
      );
    },
    {
      enabled: !isEmpty(aggregates),
    }
  );
};
