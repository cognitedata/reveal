import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { useSearchHistoryListQuery } from 'services/searchHistory/useSearchHistoryQuery';

import { SearchHistoryOptionType } from '../SearchHistory';

export const useSearchHistoryOptionData =
  (): SearchHistoryOptionType<string>[] => {
    const { data: searchHistory } = useSearchHistoryListQuery();

    return useMemo(() => {
      if (!searchHistory) return [];

      const history = searchHistory
        .filter((item) => !isEmpty(item.query))
        .map((searchHistoryItem) => {
          return {
            label: searchHistoryItem.query || '',
            value: searchHistoryItem.query || '',
            data: searchHistoryItem,
          };
        });

      return [
        {
          label: 'Search History',
          options: history,
          data: {
            filters: {},
          },
        },
      ];
    }, [searchHistory]);
  };
