import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import { TimeseriesFilter } from '@cognite/sdk';
import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { TimeseriesProperties } from '../../internal';
import { getTimeseriesAggregate } from '../network';

export const useTimeseriesAggregateQuery = (
  {
    filter,
    advancedFilter,
  }: {
    filter?: TimeseriesFilter;
    advancedFilter?: AdvancedFilter<TimeseriesProperties>;
  } = {},
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useQuery(
    queryKeys.aggregateTimeseries([advancedFilter, filter]),
    () => {
      return getTimeseriesAggregate(sdk, {
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
