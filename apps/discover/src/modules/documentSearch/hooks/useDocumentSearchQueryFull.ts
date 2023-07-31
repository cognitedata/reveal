import { useGeoFilter } from 'modules/map/selectors';
import {
  useAppliedDocumentFilters,
  useAppliedDocumentMapLayerFilters,
  useAppliedMapGeoJsonFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';

import { SearchQueryFull } from '../types';

export const useDocumentSearchQueryFull = (): SearchQueryFull => {
  const searchPhrase = useSearchPhrase();
  const documentFilters = useAppliedDocumentFilters();
  const geoFilter = useGeoFilter();
  const extraGeoJsonFilters = useAppliedMapGeoJsonFilters();
  const extraDocumentFilters = useAppliedDocumentMapLayerFilters();

  return {
    phrase: searchPhrase,
    facets: documentFilters,
    geoFilter,
    extraGeoJsonFilters,
    extraDocumentFilters,
  };
};
