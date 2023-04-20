import omit from 'lodash/omit';

import { InternalAssetFilters } from '@data-exploration-lib/core';
import {
  mapFiltersToAssetsAdvancedFilters,
  useAssetsMetadataKeysAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  prefix?: string;
  query?: string;
  filter?: InternalAssetFilters;
}

export const useAssetsMetadataFilterOptions = ({
  prefix,
  query,
  filter,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useAssetsMetadataKeysAggregateQuery({
    prefix,
  });

  const { data: dynamicData = [] } = useAssetsMetadataKeysAggregateQuery({
    prefix,
    advancedFilter: mapFiltersToAssetsAdvancedFilters(
      omit(filter, 'metadata'),
      query
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
