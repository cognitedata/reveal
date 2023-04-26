import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import {
  TimeseriesProperty,
  useTimeseriesUniqueValuesByProperty,
} from '../../service';
import { mapFiltersToTimeseriesAdvancedFilters } from '../transformers';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useMemo } from 'react';
import omit from 'lodash/omit';

interface Props {
  property: TimeseriesProperty;
  searchQuery?: string;
  query?: string;
  filter?: InternalTimeseriesFilters;
}

export const useTimeseriesFilterOptions = ({
  property,
  searchQuery,
  query,
  filter,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useTimeseriesUniqueValuesByProperty({ property, query, filter });

  const { data: dynamicData = [] } = useTimeseriesUniqueValuesByProperty({
    property,
    query,
    advancedFilter: mapFiltersToTimeseriesAdvancedFilters(
      omit(filter, property),
      searchQuery
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
