import omit from 'lodash/omit';

import { InternalAssetFilters } from '@data-exploration-lib/core';
import {
  mapFiltersToAssetsAdvancedFilters,
  useAssetsMetadataKeysAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  query?: string;
  searchQuery?: string;
  filter?: InternalAssetFilters;
}

export const useAssetsMetadataFilterOptions = ({
  query,
  searchQuery,
  filter,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useAssetsMetadataKeysAggregateQuery({
    query,
  });

  const { data: dynamicData = [] } = useAssetsMetadataKeysAggregateQuery({
    query,
    advancedFilter: mapFiltersToAssetsAdvancedFilters(
      omit(filter, 'metadata'),
      searchQuery
    ),
  });

  const options = useMemo(() => {
    return mergeDynamicFilterOptions(data, dynamicData);
  }, [data, dynamicData]);

  return {
    options,
    isLoading,
    isError,
  };
};
