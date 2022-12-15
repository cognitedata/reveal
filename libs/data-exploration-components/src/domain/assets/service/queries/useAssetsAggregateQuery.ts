import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from 'domain/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import { AdvancedFilter } from 'domain/builders';
import { AssetFilterProps } from '@cognite/sdk';
import { AssetsProperties, getAssetsAggregate } from 'domain/assets';

export const useAssetsAggregateQuery = (
  {
    filter,
    advancedFilter,
  }: {
    filter?: AssetFilterProps;
    advancedFilter?: AdvancedFilter<AssetsProperties>;
  } = {},
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useQuery(
    queryKeys.aggregateAssets([advancedFilter, filter]),
    () => {
      return getAssetsAggregate(sdk, {
        filter,
        advancedFilter,
      });
    },
    {
      ...(options as any),
    }
  );

  const flattenData = useMemo(
    () => (data?.items || []).flatMap(({ count }) => count),
    [data?.items]
  );

  return {
    data: { count: !isEmpty(flattenData) ? flattenData[0] : 0 },
    ...rest,
  };
};
