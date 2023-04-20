import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import {
  TimeseriesProperty,
  useTimeseriesUniqueValuesByProperty,
} from '../../service';
import { mapFiltersToTimeseriesAdvancedFilters } from '../transformers';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useMemo } from 'react';
import omit from 'lodash/omit';
import { getSearchConfig } from '../../../utils';

interface Props {
  property: TimeseriesProperty;
  query?: string;
  prefix?: string;
  filter?: InternalTimeseriesFilters;
}

export const useTimeseriesFilterOptions = ({
  property,
  query,
  prefix,
  filter,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useTimeseriesUniqueValuesByProperty({ property, prefix, filter });

  const { data: dynamicData = [] } = useTimeseriesUniqueValuesByProperty({
    property,
    prefix,
    advancedFilter: mapFiltersToTimeseriesAdvancedFilters(
      omit(filter, property),
      query,
      getSearchConfig().timeSeries
    ),
  });

  const options = useMemo(() => {
    return mergeDynamicFilterOptions(data, dynamicData);
  }, [data, dynamicData]);

  return {
    options,
    isLoading,
    isError,
  };
};
