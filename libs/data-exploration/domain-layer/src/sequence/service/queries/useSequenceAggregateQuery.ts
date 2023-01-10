import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { useQuery, UseQueryOptions } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import { SequenceFilter } from '@cognite/sdk';
import { AdvancedFilter } from '@data-exploration-lib/domain-layer';
import {
  SequenceProperties,
  getSequenceAggregate,
} from '@data-exploration-lib/domain-layer';

export const useSequenceAggregateQuery = (
  {
    filter,
    advancedFilter,
  }: {
    filter?: Required<SequenceFilter>['filter'];
    advancedFilter?: AdvancedFilter<SequenceProperties>;
  } = {},
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useQuery(
    queryKeys.aggregateSequence([advancedFilter, filter]),
    () => {
      return getSequenceAggregate(sdk, {
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
