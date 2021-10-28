import { useDispatch } from 'react-redux';

import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import { SavedSearchQuery } from 'modules/api/savedSearches/types';
import { documentSearchActions } from 'modules/documentSearch/actions';
import { DOCUMENT_FALLBACK_SEARCH_LIMIT } from 'modules/documentSearch/constants';
import { toSort } from 'modules/documentSearch/utils/toSort';
import { setSortByOptions } from 'modules/resultPanel/actions';
import { updateCategoryAppliedFilters } from 'modules/sidebar/actions';

import { updateExtraGeoJsonAppliedFilters } from '../modules/sidebar/actions';

import { useTenantConfig } from './useTenantConfig';

export const useDocumentSearch = () => {
  const dispatch = useDispatch();
  const { data: tenantConfig } = useTenantConfig();

  const doDocumentSearch = (searchQuery: SavedSearchQuery) => {
    const { geoFilter, phrase } = searchQuery;
    const phraseUndefined = isUndefined(phrase);
    const documentFilters = searchQuery.filters?.documents;
    const sortBy = get(searchQuery, 'sortBy.documents', []);

    // Skip document search if any of these are not mutated
    if (phraseUndefined && !documentFilters && !geoFilter) return;

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
          category: 'documents',
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

    const sort = sortBy.map(toSort);

    dispatch(
      documentSearchActions.search({
        filters: {
          ...tenantConfig?.documents?.filters,
        },
        sort,
        limit:
          tenantConfig?.documents?.defaultLimit ||
          DOCUMENT_FALLBACK_SEARCH_LIMIT,
      })
    );
  };

  return doDocumentSearch;
};
