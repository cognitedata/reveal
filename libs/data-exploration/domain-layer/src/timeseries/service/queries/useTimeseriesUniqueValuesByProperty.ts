import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  InternalTimeseriesFilters,
  OldTimeseriesFilters,
} from '@data-exploration-lib/core';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { TimeseriesProperties } from '../../internal';
import { getTimeseriesUniqueValuesByProperty } from '../network';
import { TimeseriesProperty } from '../types';

interface Props {
  property: TimeseriesProperty;
  query?: string;
  filter?: InternalTimeseriesFilters | OldTimeseriesFilters;
  advancedFilter?: AdvancedFilter<TimeseriesProperties>;
}

export const useTimeseriesUniqueValuesByProperty = ({
  property,
  query,
  filter,
  advancedFilter,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesUniqueValues(property, query, filter, advancedFilter),
    () => {
      return getTimeseriesUniqueValuesByProperty(sdk, property, {
        filter: transformNewFilterToOldFilter(filter),
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    }
  );
};
