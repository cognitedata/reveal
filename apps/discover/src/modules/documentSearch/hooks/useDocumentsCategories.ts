import { useQuery, UseQueryResult } from 'react-query';

import { DOCUMENTS_AGGREGATES } from 'constants/react-query';
import { documentSearchService } from 'modules/documentSearch/service';
import { AggregateNames, CategoryResponse } from 'modules/documentSearch/types';
import { useGeoFilter } from 'modules/map/selectors';
import {
  useAppliedDocumentFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';

export const useDocumentsCategories = (
  category: AggregateNames
): UseQueryResult<CategoryResponse> => {
  const searchPhrase = useSearchPhrase();
  const documentFilters = useAppliedDocumentFilters();
  const geoFilter = useGeoFilter();

  const query = {
    phrase: searchPhrase,
    facets: { ...documentFilters, [category]: [] },
    geoFilter,
  };

  return useQuery<CategoryResponse>(
    [DOCUMENTS_AGGREGATES[category], query],
    () => documentSearchService.getCategoriesByQuery(query, {}, category)
  );
};
