import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { InternalDocumentFilter } from '@data-exploration-lib/domain-layer';
import { useQuery } from 'react-query';
import { getDocumentAggregateCount } from '../../network/getDocumentAggregateCount';
import { useMemo } from 'react';
import { mapFiltersToDocumentSearchFilters } from '@data-exploration-lib/domain-layer';
import { EMPTY_OBJECT } from '@data-exploration-lib/core';

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
