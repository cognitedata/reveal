import { useQuery } from 'react-query';

import isEmpty from 'lodash/isEmpty';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { documentSearchService } from 'modules/documentSearch/service';
import { DocumentResultFacets } from 'modules/documentSearch/types';
import { mergeDocumentResultFacets } from 'modules/documentSearch/utils/merge';
import { useWellInspectSelectedWellbores } from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectWellboreAssetIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';
import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';

import { formatAssetIdsFilter } from '../utils';

export const useRelatedDocumentResultFacetsQuery = () => {
  const selectedWellbores = useWellInspectSelectedWellbores();
  const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();

  const wellboreAssetIds = selectedWellbores.map(
    (row) => wellboreAssetIdMap[row.id]
  );
  const isV3Enabled = useEnabledWellSdkV3();

  const batchedFilters = formatAssetIdsFilter(wellboreAssetIds, isV3Enabled);

  return useQuery<DocumentResultFacets>(
    [
      WELL_QUERY_KEY.RELATED_DOCUMENT_FACETS,
      wellboreAssetIds,
      ...batchedFilters,
    ],
    async () => {
      const results = await Promise.all(
        batchedFilters.map(async ({ filters }) =>
          documentSearchService.getCategoriesByAssetIds(filters)
        )
      );

      return mergeDocumentResultFacets(results);
    },
    {
      enabled: isV3Enabled !== undefined && !isEmpty(batchedFilters),
    }
  );
};
