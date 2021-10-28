import { StoreState } from 'core/types';

import { SearchQueryFull } from '../types';

export const getPreparedQuery = (
  state: StoreState,
  extras = {}
): SearchQueryFull => {
  return {
    phrase: state.sidebar.searchPhrase || '',
    geoFilter: [...state.map.geoFilter],
    facets: state.sidebar.appliedFilters.documents,
    ...extras,
    extraGeoJsonFilters: state.sidebar.appliedFilters.extraGeoJsonFilters,
    extraDocumentFilters: state.sidebar.appliedFilters.extraDocumentsFilters,
  };
};
