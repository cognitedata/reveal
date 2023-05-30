import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { useSDK } from '@cognite/sdk-provider';

import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { TimeseriesProperties } from '../../internal';
import { getTimeseriesMetadataValuesAggregate } from '../network';
import { TimeseriesMetadataAggregateResponse } from '../types';

interface Props {
  metadataKey?: string | null;
  query?: string;
  advancedFilter?: AdvancedFilter<TimeseriesProperties>;
  filter?: InternalTimeseriesFilters;
  options?: UseQueryOptions<
    TimeseriesMetadataAggregateResponse[],
    unknown,
    TimeseriesMetadataAggregateResponse[],
    any
  >;
}

export const useTimeseriesMetadataValuesAggregateQuery = ({
  metadataKey,
  query,
  advancedFilter,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesMetadataValues(
      String(metadataKey),
      query,
      advancedFilter,
      filter
    ),
    () => {
      return getTimeseriesMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
