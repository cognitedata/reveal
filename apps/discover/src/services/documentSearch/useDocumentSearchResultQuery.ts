import { useQuery } from 'react-query';

import { Metrics } from '@cognite/metrics';

import {
  LOG_DOCUMENT_SEARCH,
  LOG_DOCUMENT_SEARCH_NAMESPACE,
} from 'constants/logging';
import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { TimeLogStages } from 'hooks/useTimeLog';

import { DOCUMENT_FALLBACK_SEARCH_LIMIT } from '../../modules/documentSearch/constants';
import { useDocumentSearchOptions } from '../../modules/documentSearch/hooks/useDocumentSearchOptions';
import { useDocumentSearchQueryFull } from '../../modules/documentSearch/hooks/useDocumentSearchQueryFull';
import { documentSearchService } from '../../modules/documentSearch/service';
import { getEmptyDocumentResult } from '../../modules/documentSearch/utils';
import { handleDocumentSearchError } from '../../modules/documentSearch/utils/documentSearch';

const documentSearchMetric = Metrics.create(LOG_DOCUMENT_SEARCH);

export const useDocumentSearchResultQuery = () => {
  const searchQuery = useDocumentSearchQueryFull();
  const options = useDocumentSearchOptions();
  const { data: projectConfig } = useProjectConfig();

  const limit =
    projectConfig?.documents?.defaultLimit || DOCUMENT_FALLBACK_SEARCH_LIMIT;

  const { data, isLoading } = useQuery(
    [DOCUMENTS_QUERY_KEY.SEARCH, searchQuery, options],
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
