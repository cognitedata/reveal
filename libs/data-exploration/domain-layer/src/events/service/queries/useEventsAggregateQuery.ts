import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import {
  EventsProperties,
  getEventsAggregate,
} from '@data-exploration-lib/domain-layer';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { useQuery, UseQueryOptions } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import { EventFilter } from '@cognite/sdk';
import { AdvancedFilter } from '@data-exploration-lib/domain-layer';

// TODO: is it used anymore?
export const useEventsAggregateQuery = (
  {
    filter,
    advancedFilter,
  }: {
    filter?: EventFilter;
    advancedFilter?: AdvancedFilter<EventsProperties>;
  } = {},
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useQuery(
    queryKeys.aggregateEvents([advancedFilter, filter]),
    () => {
      return getEventsAggregate(sdk, {
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
