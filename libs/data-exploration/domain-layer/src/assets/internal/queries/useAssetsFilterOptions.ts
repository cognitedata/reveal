import { useMemo } from 'react';

import { InternalAssetFilters } from '@data-exploration-lib/core';

import omit from 'lodash/omit';

import {
  AssetProperty,
  useAssetsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { getSearchConfig } from '../../../utils';
import { mapFiltersToAssetsAdvancedFilters } from '..';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  property: AssetProperty;
  /**
   * If the property is different from what we input for transformer.
   * Example: source and sources
   * Better to fix this in future and remove this.
   */
  filterProperty?: string;
  query?: string;
  filter?: InternalAssetFilters;
  prefix?: string;
}

export const useAssetsFilterOptions = ({
  property,
  filterProperty,
  query,
  filter = {},
  prefix,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useAssetsUniqueValuesByProperty({
    property,
    query,
    prefix,
  });

  const { data: dynamicData = [] } = useAssetsUniqueValuesByProperty({
    property,
    query,
    advancedFilter: mapFiltersToAssetsAdvancedFilters(
      omit(filter, filterProperty || property),
      query,
      getSearchConfig().asset
    ),
    prefix,
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
