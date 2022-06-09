import { SavedSearchQuery } from 'domain/savedSearches/types';

import { useDispatch } from 'react-redux';

import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import { updateCategoryAppliedFilters } from 'modules/sidebar/actions';
import { Modules } from 'modules/sidebar/types';

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
        updateCategoryAppliedFilters({
          category: Modules.WELLS,
          value: wellFilters,
        })
      );
    }
  };

  return doWellsSearch;
};
