import { InternalAssetFilters } from '@data-exploration-lib/core';
import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { AssetsProperties } from '../../internal';
import { getAssetsUniqueValuesByProperty } from '../network';
import { AssetProperty } from '../types';

interface Props {
  property: AssetProperty;
  searchQuery?: string;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
  filter?: InternalAssetFilters;
  query?: string;
}

export const useAssetsUniqueValuesByProperty = ({
  property,
  searchQuery,
  advancedFilter,
  filter,
  query,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsUniqueValues(
      property,
      searchQuery,
      advancedFilter,
      query || '',
      filter
    ),
    () => {
      return getAssetsUniqueValuesByProperty(sdk, property, {
        advancedFilter,
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
