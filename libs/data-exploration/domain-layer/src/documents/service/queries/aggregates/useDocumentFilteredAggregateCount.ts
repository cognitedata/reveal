import { useMemo } from 'react';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  EMPTY_OBJECT,
  FileConfigType,
  InternalDocumentFilter,
} from '@data-exploration-lib/core';

import { queryKeys } from '../../../../queryKeys';
import { mapFiltersToDocumentSearchFilters } from '../../../internal';
import { getDocumentAggregateCount } from '../../network/getDocumentAggregateCount';

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
