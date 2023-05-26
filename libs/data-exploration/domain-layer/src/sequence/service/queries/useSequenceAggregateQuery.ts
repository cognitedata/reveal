import { useMemo } from 'react';

import { EMPTY_OBJECT } from '@data-exploration-lib/core';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { SequenceFilter } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { SequenceProperties } from '../../internal';
import { getSequencesAggregate } from '../network';

export const useSequenceAggregateQuery = (
  {
    filter,
    advancedFilter,
  }: {
    filter?: SequenceFilter['filter'];
    advancedFilter?: AdvancedFilter<SequenceProperties>;
  } = EMPTY_OBJECT,
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useQuery(
    queryKeys.aggregateSequence([advancedFilter, filter]),
    () => {
      return getSequencesAggregate(sdk, {
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
