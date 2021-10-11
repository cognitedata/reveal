import { SavedSearchContent } from 'modules/api/savedSearches/types';
import { useGeoFilter } from 'modules/map/selectors';
import { useSortByOptions } from 'modules/resultPanel/selectors';
import {
  useSearchPhrase,
  useAppliedDocumentFilters,
  useAppliedWellFilters,
} from 'modules/sidebar/selectors';

export const useCurrentSavedSearchState = (): SavedSearchContent => {
  const searchPhrase = useSearchPhrase();
  const documentFilters = useAppliedDocumentFilters();
  const wellFilters = useAppliedWellFilters();
  const sortByOptions = useSortByOptions();
  const geoFilter = useGeoFilter();

  return {
    query: searchPhrase,
    filters: {
      documents: { facets: documentFilters },
      wells: wellFilters,
    },
    sortBy: sortByOptions,
    geoJson: geoFilter,
  };
};
