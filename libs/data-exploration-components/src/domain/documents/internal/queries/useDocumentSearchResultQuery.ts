import { useMemo } from 'react';
import { normalize } from '../transformers';

import { DocumentSearchItem } from '@cognite/sdk';

import {
  InternalDocumentFilter,
  mapFiltersToDocumentSearchFilters,
  mapTableSortByToDocumentSortFields,
  TableSortBy,
} from 'index';
import { UseInfiniteQueryOptions } from 'react-query';
import { EMPTY_OBJECT } from 'utils';
import { useDocumentSearchQuery } from '../../service';

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
  options: UseInfiniteQueryOptions = {}
) => {
  const transformFilter = useMemo(
    () => mapFiltersToDocumentSearchFilters(filter, query),
    [filter, query]
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
      query,
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
