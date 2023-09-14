import { useMemo } from 'react';

import { sortObjectByNumberValue } from '../../../../app/utils/sort';
import { useSearchAggregateQuery } from '../../../services/dataTypes/queries/useSearchAggregateQuery';

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
