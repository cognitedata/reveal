import { useMemo } from 'react';
import {
  mapFiltersToDocumentSearchFilters,
  mapTableSortByToDocumentSortFields,
  normalize,
} from '../transformers';

import { DocumentSearchItem } from '@cognite/sdk';

import { TableSortBy } from '@data-exploration-lib/domain-layer';
import { UseInfiniteQueryOptions } from 'react-query';
import { useDocumentSearchQuery } from '../../service';
import {
  EMPTY_OBJECT,
  FileConfigType,
  InternalDocumentFilter,
} from '@data-exploration-lib/core';

export const useDocumentSearchResultQuery = (
  {
    filter = EMPTY_OBJECT,
    limit,
    query,
    sortBy,
  }: {
    filter?: InternalDocumentFilter;
    query?: string;
    limit?: number;
    sortBy?: TableSortBy[];
  } = {},
  options: UseInfiniteQueryOptions = {},
  searchConfig?: FileConfigType
) => {
  const transformFilter = useMemo(
    () => mapFiltersToDocumentSearchFilters(filter, query, searchConfig),
    [filter, query, searchConfig]
  );

  const sort = useMemo(
    () => mapTableSortByToDocumentSortFields(sortBy),
    [sortBy]
  );

  const response = useDocumentSearchQuery(
    {
      filter: transformFilter as any,
      sort,
      limit,
    },
    { ...options }
  );

  const results = response?.data
    ? response.data?.pages.reduce((result: DocumentSearchItem[], page) => {
        return [...result, ...page.items];
      }, [])
    : [];

  return {
    ...response,
    results: normalize(results),
  };
};
