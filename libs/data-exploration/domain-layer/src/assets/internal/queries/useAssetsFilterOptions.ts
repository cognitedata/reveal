import { useMemo } from 'react';

import { InternalAssetFilters } from '@data-exploration-lib/core';

import omit from 'lodash/omit';

import {
  AssetProperty,
  useAssetsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { mapFiltersToAssetsAdvancedFilters } from '..';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { getAssetSubtreeIdFilter } from '../../../utils';

interface Props {
  property: AssetProperty;
  /**
   * If the property is different from what we input for transformer.
   * Example: source and sources
   * Better to fix this in future and remove this.
   */
  filterProperty?: string;
  searchQuery?: string;
  filter?: InternalAssetFilters;
  query?: string;
}

export const useAssetsFilterOptions = ({
  property,
  filterProperty,
  searchQuery,
  filter = {},
  query,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useAssetsUniqueValuesByProperty({
    property,
    searchQuery,
    query,
  });

  const omittedFilter = omit(filter, filterProperty || property);

  const { data: dynamicData = [] } = useAssetsUniqueValuesByProperty({
    property,
    searchQuery,
    advancedFilter: mapFiltersToAssetsAdvancedFilters(
      omittedFilter,
      searchQuery
    ),
    filter: getAssetSubtreeIdFilter(omittedFilter),
    query,
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
