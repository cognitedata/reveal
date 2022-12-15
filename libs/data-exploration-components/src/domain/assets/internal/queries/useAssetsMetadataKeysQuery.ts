import { useAssetsListQuery } from 'domain/assets';
import { mapMetadataKeysWithQuery } from 'domain/transformers';
import { isEmpty } from 'lodash';
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
