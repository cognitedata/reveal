import { SavedSearchContent } from 'domain/savedSearches/types';

import { batch } from 'react-redux';

import { FetchHeaders } from 'utils/fetch';

import { useCommonSearch } from './useCommonSearch';

export const useSearchActions = () => {
  const doCommonSearch = useCommonSearch();

  const doCommonSearchBatched = (
    searchQuery: Partial<SavedSearchContent>,
    headers?: FetchHeaders
  ) => batch(() => doCommonSearch(searchQuery, headers));

  return { doCommonSearch: doCommonSearchBatched };
};
