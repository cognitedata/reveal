import { SavedSearchItem } from 'domain/savedSearches/types';

import { useHistory } from 'react-router-dom';

import navigation from 'constants/navigation';

import { isAnyFilterApplied } from './useSearchHasAnyAppliedFilters';

export const DEFAULT_SAVED_SEARCH_NAVIGATION = navigation.SEARCH_DOCUMENTS;

export const useSavedSearchNavigation = () => {
  const history = useHistory();

  const getNavigationUrlForSavedSearch = (item: SavedSearchItem) => {
    const { documents, wells } = item.value.filters;

    if (isAnyFilterApplied(documents)) return navigation.SEARCH_DOCUMENTS;
    if (isAnyFilterApplied(wells)) return navigation.SEARCH_WELLS;

    return DEFAULT_SAVED_SEARCH_NAVIGATION;
  };

  const handleNavigationOnLoadSavedSearch = (item: SavedSearchItem) => {
    const navigationUrl = getNavigationUrlForSavedSearch(item);
    history.push(navigationUrl);
  };

  return (item: SavedSearchItem) => handleNavigationOnLoadSavedSearch(item);
};
