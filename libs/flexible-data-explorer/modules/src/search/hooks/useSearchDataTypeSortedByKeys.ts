import { useMemo } from 'react';

import { useSearchAggregateQuery } from '@fdx/services/dataTypes/queries/useSearchAggregateQuery';
import { sortObjectByNumberValue } from '@fdx/shared/utils/sort';

export const useSearchDataTypeSortedByKeys = () => {
  const { data: counts, ...rest } = useSearchAggregateQuery();
  const sortedDataTypesKeys = useMemo(() => {
    if (!counts) {
      return [];
    }

    return sortObjectByNumberValue(counts);
  }, [counts]);

  return { counts, keys: sortedDataTypesKeys, ...rest };
};
