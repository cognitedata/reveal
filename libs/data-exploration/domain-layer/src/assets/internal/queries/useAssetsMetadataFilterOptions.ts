import omit from 'lodash/omit';

import { InternalAssetFilters } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { getAssetSubtreeIdFilter } from '../../../utils';
import { mapFiltersToAssetsAdvancedFilters } from '..';
import { useAssetsMetadataKeysAggregateQuery } from '../../service';

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

  const omittedFilter = omit(filter, 'metadata');

  const { data: dynamicData = [] } = useAssetsMetadataKeysAggregateQuery({
    query,
    advancedFilter: mapFiltersToAssetsAdvancedFilters(
      omittedFilter,
      searchQuery
    ),
    filter: getAssetSubtreeIdFilter(omittedFilter),
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
