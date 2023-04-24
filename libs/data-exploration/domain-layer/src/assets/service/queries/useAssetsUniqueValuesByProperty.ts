import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  AssetProperty,
  getAssetsUniqueValuesByProperty,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { AssetsProperties } from '../../internal';
// import {
//   InternalAssetFilters,
//   OldAssetFilters,
// } from '@data-exploration-lib/core';

interface Props {
  property: AssetProperty;
  query?: string;
  // filter?: InternalAssetFilters | OldAssetFilters;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
  prefix?: string;
}

export const useAssetsUniqueValuesByProperty = ({
  property,
  query,
  // filter,
  advancedFilter,
  prefix,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsUniqueValues(property, query, advancedFilter, prefix),
    () => {
      return getAssetsUniqueValuesByProperty(sdk, property, {
        advancedFilter,
        aggregateFilter: prefix ? { prefix: { value: prefix } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
