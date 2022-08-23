import { useDocumentSearchState } from '../providers';
import { SearchQueryFull } from '../utils/types';

export const useDocumentSearchQueryFull = (): SearchQueryFull => {
  const {
    phrase: searchPhrase,
    facets: documentFilters,
    geoFilter,
    extraDocumentFilters,
    extraGeoJsonFilters,
  } = useDocumentSearchState();

  return {
    phrase: searchPhrase,
    facets: documentFilters,
    geoFilter,
    extraGeoJsonFilters,
    extraDocumentFilters,
  };
};
