import { useQuery, UseQueryResult } from 'react-query';

import isEmpty from 'lodash/isEmpty';

import {
  LOG_RELATED_DOCUMENTS,
  LOG_WELLS_RELATED_DOCUMENTS,
} from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { TimeLogStages, useMetricLogger } from 'hooks/useTimeLog';
import { documentSearchService } from 'modules/documentSearch/service';
import { DocumentResult } from 'modules/documentSearch/types';
import { mergeDocumentResults } from 'modules/documentSearch/utils/merge';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectWellboreAssetIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';
import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';

import {
  formatAssetIdsFilter,
  getDocumentCategoriesWithSelection,
} from '../utils';

import { useRelatedDocumentCategories } from './useRelatedDocumentCategories';
import { useRelatedDocumentFilterQuery } from './useRelatedDocumentFilterQuery';

export const useRelatedDocumentResultQuery = (
  limit = 100
): UseQueryResult<DocumentResult> => {
  const [startNetworkTimer, stopNetworkTimer] = useMetricLogger(
    LOG_RELATED_DOCUMENTS,
    TimeLogStages.Network,
    LOG_WELLS_RELATED_DOCUMENTS
  );
  const filterQuery = useRelatedDocumentFilterQuery();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();
  const isV3Enabled = useEnabledWellSdkV3();

  const batchedFilters = formatAssetIdsFilter(
    wellboreIds.map((id) => wellboreAssetIdMap[id]),
    isV3Enabled
  );

  const queryResponse = useQuery<DocumentResult>(
    [WELL_QUERY_KEY.RELATED_DOCUMENTS, filterQuery, ...batchedFilters],
    async () => {
      startNetworkTimer();

      const results = await Promise.all(
        batchedFilters.map(({ filters }) => {
          const filterOptions = {
            filters,
            sort: [],
          };
          return documentSearchService
            .search(filterQuery, filterOptions, limit)
            .finally(() => {
              stopNetworkTimer();
            });
        })
      );

      return mergeDocumentResults(results);
    },
    {
      enabled: !isEmpty(batchedFilters),
    }
  );

  const documentCategories = useRelatedDocumentCategories(batchedFilters);

  if (queryResponse.data) {
    queryResponse.data.facets = getDocumentCategoriesWithSelection(
      documentCategories,
      filterQuery
    );
  }

  return queryResponse;
};
