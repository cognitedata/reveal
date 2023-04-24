import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  getTimeseriesUniqueValuesByProperty,
  queryKeys,
  TimeseriesProperties,
  TimeseriesProperty,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import {
  InternalTimeseriesFilters,
  OldTimeseriesFilters,
} from '@data-exploration-lib/core';

interface Props {
  property: TimeseriesProperty;
  prefix?: string;
  filter?: InternalTimeseriesFilters | OldTimeseriesFilters;
  advancedFilter?: AdvancedFilter<TimeseriesProperties>;
}

export const useTimeseriesUniqueValuesByProperty = ({
  property,
  prefix,
  filter,
  advancedFilter,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesUniqueValues(property, prefix, filter, advancedFilter),
    () => {
      return getTimeseriesUniqueValuesByProperty(sdk, property, {
        filter: transformNewFilterToOldFilter(filter),
        advancedFilter,
        aggregateFilter: prefix ? { prefix: { value: prefix } } : undefined,
      });
    }
  );
};
