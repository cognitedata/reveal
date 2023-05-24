import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  AssetProperty,
  getAssetsUniqueValuesByProperty,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { AssetsProperties } from '../../internal';
import { InternalAssetFilters } from '@data-exploration-lib/core';

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
