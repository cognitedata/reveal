import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from 'domain/queryKeys';
import { InternalDocumentFilter } from 'domain/documents';
import { useQuery } from 'react-query';
import { getDocumentAggregateCount } from '../../network/getDocumentAggregateCount';
import { useMemo } from 'react';
import { mapFiltersToDocumentSearchFilters } from 'domain/documents';
import { EMPTY_OBJECT } from 'utils';

export const useDocumentFilteredAggregateCount = ({
  filters = EMPTY_OBJECT,
  query,
}: {
  filters?: InternalDocumentFilter;
  query?: string;
}) => {
  const sdk = useSDK();

  const transformFilter = useMemo(
    () => mapFiltersToDocumentSearchFilters(filters, query),
    [filters, query]
  );

  return useQuery(
    queryKeys.documentsAggregatesCountFiltered(transformFilter, query || ''),
    () => {
      return getDocumentAggregateCount(
        {
          filter: transformFilter as any,
          ...(query ? { search: { query } } : {}),
        },
        sdk
      );
    }
  );
};
