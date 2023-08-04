import { useMemo } from 'react';

import head from 'lodash/head';

import { SearchResponse } from '../../../services/types';

export const useAiResultsCounts = (results: Record<string, SearchResponse>) => {
  return useMemo(() => {
    return Object.entries(results).reduce((acc, [_, { items }]) => {
      const dataType = head(items)?.__typename;

      if (!dataType) {
        return acc;
      }

      return {
        ...acc,
        [dataType]: items.length,
      };
    }, {} as Record<string, number>);
  }, [results]);
};
