import { SavedSearchQuery } from 'domain/savedSearches/types';

import { useDispatch } from 'react-redux';

import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import { documentSearchActions } from 'modules/documentSearch/actions';
import { useExtractParentFolderPath } from 'modules/documentSearch/selectors';
import { setSortByOptions } from 'modules/resultPanel/actions';
import {
  updateCategoryAppliedFilters,
  updateExtraGeoJsonAppliedFilters,
} from 'modules/sidebar/actions';
import { Modules } from 'modules/sidebar/types';

export const useDocumentSearch = () => {
  const dispatch = useDispatch();
  const extractParentFolderPath = useExtractParentFolderPath();

  const doDocumentSearch = (searchQuery: SavedSearchQuery) => {
    const { geoFilter, phrase } = searchQuery;
    const phraseUndefined = isUndefined(phrase);
    const documentFilters = searchQuery.filters?.documents;
    const sortBy = get(searchQuery, 'sortBy.documents', []);

    // Skip document search if any of these are not mutated
    if (phraseUndefined && !documentFilters && !geoFilter) {
      return;
    }

    /**
     * Clear `extractParentFolderPath` if exists.
     * So, the search action works as normal.
     */
    if (extractParentFolderPath) {
      dispatch(documentSearchActions.clearExtractParentFolderPath());
    }

    /**
     * Set sortBy options to state
     */
    dispatch(
      setSortByOptions({
        documents: sortBy,
      })
    );

    /**
     * Set document filters to state
     */
    if (documentFilters) {
      dispatch(
        updateCategoryAppliedFilters({
          category: Modules.DOCUMENTS,
          value: documentFilters.facets,
          extraDocumentFilters:
            searchQuery.filters?.documents?.extraDocumentFilters,
        })
      );
    }

    // Set extra map geo filters
    if (searchQuery.filters?.extraGeoJsonFilters) {
      dispatch(
        updateExtraGeoJsonAppliedFilters(
          searchQuery.filters.extraGeoJsonFilters
        )
      );
    }
  };

  return doDocumentSearch;
};
