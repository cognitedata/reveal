import { useMemo } from 'react';

import { useSearchAggregateQuery } from '../../../services/dataTypes/queries/useSearchAggregateQuery';

export const useSearchDataTypeSortedByKeys = () => {
  const { data: counts, ...rest } = useSearchAggregateQuery();

  const sortedDataTypesKeys = useMemo(() => {
    if (!counts) {
      return [];
    }

    return Object.keys(counts).sort((a, b) => {
      const aCount = counts[a];
      const bCount = counts[b];

      return bCount - aCount;
    });
  }, [counts]);

  return { counts, keys: sortedDataTypesKeys, ...rest };
};
