import { useAssetsListQuery } from '@data-exploration-lib/domain-layer';
import { mapMetadataKeysWithQuery } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import { useMemo } from 'react';
import { InternalAssetFilters, mapFiltersToAssetsAdvancedFilters } from '..';

export const useAssetsSearchQueryMetadataKeysQuery = (
  query: string | undefined,
  assetsFilters: InternalAssetFilters
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(assetsFilters),
    [assetsFilters]
  );

  const { data } = useAssetsListQuery(
    { advancedFilter },
    { enabled: !isEmpty(query) }
  );

  return useMemo(() => mapMetadataKeysWithQuery(data, query), [data, query]);
};
