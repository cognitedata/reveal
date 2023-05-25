import { useSDK } from '@cognite/sdk-provider';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  InternalTimeseriesFilters,
  TimeseriesConfigType,
} from '@data-exploration-lib/core';
import { queryKeys } from '../../../queryKeys';
import {
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
} from '../../internal';
import { getTimeseriesAggregateCount } from '../network';

export const useTimeseriesAggregateCountQuery = (
  {
    query,
    timeseriesFilters,
  }: {
    query?: string;
    timeseriesFilters: InternalTimeseriesFilters;
  },
  searchConfig?: TimeseriesConfigType,
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const advancedFilter = useMemo(
    () =>
      mapFiltersToTimeseriesAdvancedFilters(
        timeseriesFilters,
        query,
        searchConfig
      ),
    [timeseriesFilters, query, searchConfig]
  );

  const filter = useMemo(
    () => mapInternalFilterToTimeseriesFilter(timeseriesFilters),
    [timeseriesFilters]
  );

  return useQuery(
    queryKeys.aggregateTimeseries([advancedFilter, filter, 'count']),
    () => {
      return getTimeseriesAggregateCount(sdk, {
        filter,
        advancedFilter,
      });
    },
    {
      ...(options as any),
    }
  );
};
