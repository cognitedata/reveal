import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  AssetsMetadataAggregateResponse,
  AssetsProperties,
  getAssetsMetadataKeysAggregate,
  queryKeys,
} from '@data-exploration-lib/domain-layer';

interface Props {
  prefix?: string;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
  options?: UseQueryOptions<
    AssetsMetadataAggregateResponse[],
    unknown,
    AssetsMetadataAggregateResponse[],
    any
  >;
}

export const useAssetsMetadataKeysAggregateQuery = ({
  prefix,
  advancedFilter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadata(prefix, advancedFilter),
    () => {
      return getAssetsMetadataKeysAggregate(sdk, {
        advancedFilter,
        aggregateFilter: prefix ? { prefix: { value: prefix } } : undefined,
      });
    },
    {
      keepPreviousData: true,
      ...options,
    }
  );
};
