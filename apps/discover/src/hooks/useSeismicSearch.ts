import { QueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

import isUndefined from 'lodash/isUndefined';
import { FetchHeaders } from 'utils/fetch';

import { SavedSearchQuery } from 'modules/api/savedSearches/types';
import { seismicSearchActions } from 'modules/seismicSearch/actions';
import { prefetchSurveys } from 'modules/seismicSearch/hooks';

export const useSeismicSearch = () => {
  const dispatch = useDispatch();

  const doSeismicSearch = (
    searchQuery: SavedSearchQuery,
    headers: FetchHeaders,
    queryClient: QueryClient
  ) => {
    if (!isUndefined(searchQuery.phrase) && searchQuery.phrase === '') {
      dispatch(seismicSearchActions.resetDataSearch());
    }
    prefetchSurveys(headers, queryClient);
  };

  return doSeismicSearch;
};
