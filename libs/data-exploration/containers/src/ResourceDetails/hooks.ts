import { useCallback, useMemo, useState } from 'react';

import { useDebounce } from 'use-debounce';

import { InternalCommonFilters } from '@data-exploration-lib/core';
import { TableSortBy } from '@data-exploration-lib/domain-layer';

export const useLocalFilterState = <T extends InternalCommonFilters>({
  baseFilter,
}: {
  baseFilter: T;
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const [filter, setFilter] = useState<T>({} as T);

  const mergeSetFilter = useCallback(
    (newFilter: Partial<T>) => {
      setFilter((prevFilter) => ({
        ...prevFilter,
        ...newFilter,
      }));
    },
    [setFilter]
  );

  const composedFilter = useMemo(() => {
    return {
      ...filter,
      ...baseFilter,
    };
  }, [baseFilter, filter]);

  return {
    query,
    setQuery,
    debouncedQuery,
    filter,
    setFilter: mergeSetFilter,
    composedFilter,
    sortBy,
    setSortBy,
  };
};
