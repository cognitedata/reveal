import { useSearchHistoryListQuery } from 'domain/searchHistory/internal/queries/useSearchHistoryQuery';

import { useQueryClient } from 'react-query';

import { SEARCH_HISTORY_KEY } from 'constants/react-query';
import { useCurrentSavedSearchState } from 'modules/sidebar/selectors/useCurrentSavedSearchState';

export const useUpdateSearchHistoryListQuery = () => {
  const queryClient = useQueryClient();
  const currentSavedSearch = useCurrentSavedSearchState();
  const { data: searchHistory } = useSearchHistoryListQuery();
  const currentSearchHistoryList = searchHistory || [];

  return () => {
    const currentSearchQueryEqualsToLastSearchHistoryItem =
      currentSearchHistoryList.length &&
      currentSearchHistoryList[0].query === currentSavedSearch.query;

    const updatedSearchHistory = currentSearchQueryEqualsToLastSearchHistoryItem
      ? [currentSavedSearch].concat(currentSearchHistoryList.slice(1))
      : [currentSavedSearch].concat(currentSearchHistoryList);

    queryClient.setQueryData(SEARCH_HISTORY_KEY.LIST, updatedSearchHistory);
  };
};
