import { useQuery } from 'react-query';

import { Metrics } from '@cognite/metrics';

import {
  LOG_DOCUMENT_SEARCH,
  LOG_DOCUMENT_SEARCH_NAMESPACE,
} from 'constants/logging';
import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { TimeLogStages } from 'hooks/useTimeLog';
import { useGeoFilter } from 'modules/map/selectors';
import { useSortByOptions } from 'modules/resultPanel/selectors';
import {
  useAppliedDocumentFilters,
  useAppliedDocumentMapLayerFilters,
  useAppliedMapGeoJsonFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';

import { DOCUMENT_FALLBACK_SEARCH_LIMIT } from '../constants';
import { documentSearchService } from '../service';
import { SearchQueryFull } from '../types';
import { getEmptyDocumentResult } from '../utils';
import { handleDocumentSearchError } from '../utils/documentSearch';
import { toSort } from '../utils/toSort';

const documentSearchMetric = Metrics.create(LOG_DOCUMENT_SEARCH);

export const useDocumentSearchResultQuery = () => {
  const searchPhrase = useSearchPhrase();
  const documentFilters = useAppliedDocumentFilters();
  const geoFilter = useGeoFilter();
  const extraGeoJsonFilters = useAppliedMapGeoJsonFilters();
  const extraDocumentFilters = useAppliedDocumentMapLayerFilters();

  const { data: projectConfig } = useProjectConfig();
  const sortByOptions = useSortByOptions();

  const searchQuery: SearchQueryFull = {
    phrase: searchPhrase,
    facets: documentFilters,
    geoFilter,
    extraGeoJsonFilters,
    extraDocumentFilters,
  };

  const options = {
    filters: { ...projectConfig?.documents?.filters },
    sort: sortByOptions.documents?.map(toSort) || [],
  };

  const limit =
    projectConfig?.documents?.defaultLimit || DOCUMENT_FALLBACK_SEARCH_LIMIT;

  const { data, isLoading } = useQuery(
    [DOCUMENTS_QUERY_KEY.SEARCH, searchQuery],
    () => {
      const timer = documentSearchMetric.start(LOG_DOCUMENT_SEARCH_NAMESPACE, {
        stage: TimeLogStages.Network,
      });

      return documentSearchService
        .search(searchQuery, options, limit)
        .catch(handleDocumentSearchError)
        .finally(() => timer.stop());
    }
  );

  if (!data || isLoading) {
    return { data: getEmptyDocumentResult(), isLoading: true };
  }

  return { data, isLoading };
};
