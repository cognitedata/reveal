import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  AssetProperty,
  getAssetsUniqueValuesByProperty,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { AssetsProperties } from '../../internal';

interface Props {
  property: AssetProperty;
  searchQuery?: string;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
  query?: string;
}

export const useAssetsUniqueValuesByProperty = ({
  property,
  searchQuery,
  advancedFilter,
  query,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsUniqueValues(property, searchQuery, advancedFilter, query),
    () => {
      return getAssetsUniqueValuesByProperty(sdk, property, {
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
