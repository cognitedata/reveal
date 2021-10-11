import { QueryClient } from 'react-query';
import { batch } from 'react-redux';

import { FetchHeaders } from '_helpers/fetch';
import { SavedSearchContent } from 'modules/api/savedSearches';

import { useCommonSearch } from './useCommonSearch';

export const useSearchActions = () => {
  const doCommonSearch = useCommonSearch();

  const doCommonSearchBatched = (
    searchQuery: Partial<SavedSearchContent>,
    queryClient: QueryClient,
    headers?: FetchHeaders
  ) => batch(() => doCommonSearch(searchQuery, queryClient, headers));

  return { doCommonSearch: doCommonSearchBatched };
};
