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
  query?: string;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
  options?: UseQueryOptions<
    AssetsMetadataAggregateResponse[],
    unknown,
    AssetsMetadataAggregateResponse[],
    any
  >;
}

export const useAssetsMetadataKeysAggregateQuery = ({
  query,
  advancedFilter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadata(query, advancedFilter),
    () => {
      return getAssetsMetadataKeysAggregate(sdk, {
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
      ...options,
    }
  );
};
