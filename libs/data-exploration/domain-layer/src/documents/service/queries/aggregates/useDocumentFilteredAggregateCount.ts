import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { useQuery } from 'react-query';
import { getDocumentAggregateCount } from '../../network/getDocumentAggregateCount';
import { useMemo } from 'react';
import { mapFiltersToDocumentSearchFilters } from '@data-exploration-lib/domain-layer';
import {
  EMPTY_OBJECT,
  FileConfigType,
  InternalDocumentFilter,
} from '@data-exploration-lib/core';
import { UseQueryOptions } from '@tanstack/react-query';

export const useDocumentFilteredAggregateCount = (
  {
    filters = EMPTY_OBJECT,
    query,
  }: {
    filters?: InternalDocumentFilter;
    query?: string;
  },
  searchConfig?: FileConfigType,
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const transformFilter = useMemo(
    () => mapFiltersToDocumentSearchFilters(filters, query, searchConfig),
    [filters, query, searchConfig]
  );

  return useQuery(
    queryKeys.documentsAggregatesCountFiltered(transformFilter, query || ''),
    () => {
      return getDocumentAggregateCount(
        {
          filter: transformFilter as any,
        },
        sdk
      );
    },
    {
      ...(options as any),
    }
  );
};
