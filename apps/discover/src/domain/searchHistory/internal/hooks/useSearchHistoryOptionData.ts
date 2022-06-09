import { useSearchHistoryListQuery } from 'domain/searchHistory/internal/queries/useSearchHistoryQuery';

import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { SearchHistoryOptionType } from '../types';

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
