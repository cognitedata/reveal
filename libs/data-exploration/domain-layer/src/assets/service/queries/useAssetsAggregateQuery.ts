import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { AssetFilterProps } from '@cognite/sdk';
import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { AssetsProperties } from '../../internal';
import { getAssetsAggregate } from '../network';

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
