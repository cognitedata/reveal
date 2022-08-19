import { SavedSearchContent } from 'domain/savedSearches/types';

import { batch } from 'react-redux';

import { FetchHeaders } from 'utils/fetch';

import { SearchOptions, useCommonSearch } from './useCommonSearch';

export const useSearchActions = (options: SearchOptions = {}) => {
  const doCommonSearch = useCommonSearch(options);

  const doCommonSearchBatched = (
    searchQuery: Partial<SavedSearchContent>,
    headers?: FetchHeaders
  ) => batch(() => doCommonSearch(searchQuery, headers));

  return { doCommonSearch: doCommonSearchBatched };
};
