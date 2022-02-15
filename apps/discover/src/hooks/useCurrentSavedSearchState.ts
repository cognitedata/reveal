import { SavedSearchState } from 'services/savedSearches';

import { useGeoFilter } from 'modules/map/selectors';
import { useSortByOptions } from 'modules/resultPanel/selectors';
import {
  useSearchPhrase,
  useAppliedDocumentFilters,
  useAppliedWellFilters,
} from 'modules/sidebar/selectors';

import {
  useAppliedDocumentMapLayerFilters,
  useAppliedMapGeoJsonFilters,
} from '../modules/sidebar/selectors';

export const useCurrentSavedSearchState = (): SavedSearchState => {
  const searchPhrase = useSearchPhrase();
  const documentFilters = useAppliedDocumentFilters();
  const wellFilters = useAppliedWellFilters();
  const sortByOptions = useSortByOptions();
  const geoFilter = useGeoFilter();
  const documentMapLayerFilters = useAppliedDocumentMapLayerFilters();
  const mapGeoJsonFilters = useAppliedMapGeoJsonFilters();

  return {
    query: searchPhrase,
    filters: {
      documents: {
        facets: documentFilters,
        extraDocumentFilters: documentMapLayerFilters,
      },
      wells: wellFilters,
      extraGeoJsonFilters: mapGeoJsonFilters,
    },
    sortBy: sortByOptions,
    geoJson: geoFilter,
  };
};
