import { useDispatch } from 'react-redux';

import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import { SavedSearchQuery } from 'services/savedSearches/types';

import { updateCategoryAppliedFilters } from 'modules/sidebar/actions';

export const useWellsSearch = () => {
  const dispatch = useDispatch();

  const doWellsSearch = (searchQuery: SavedSearchQuery) => {
    const phraseUnDefined = isUndefined(searchQuery.phrase);
    const wellFilters = searchQuery.filters?.wells;
    const geoFilter = get(searchQuery, 'geoFilter');

    // Skip well search if any of these are not mutated
    if (phraseUnDefined && !wellFilters && !geoFilter) return;

    /**
     * Set well filters to state
     */
    if (wellFilters) {
      dispatch(
        updateCategoryAppliedFilters({ category: 'wells', value: wellFilters })
      );
    }
  };

  return doWellsSearch;
};
