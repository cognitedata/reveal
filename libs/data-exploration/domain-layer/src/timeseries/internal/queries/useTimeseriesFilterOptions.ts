import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import {
  TimeseriesProperty,
  useTimeseriesUniqueValuesByProperty,
} from '../../service';
import { mapFiltersToTimeseriesAdvancedFilters } from '../transformers';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useMemo } from 'react';
import omit from 'lodash/omit';
import { getAssetSubtreeIdFilter } from '../../../utils';

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
  } = useTimeseriesUniqueValuesByProperty({ property, query });

  const omittedFilter = omit(filter, property);

  const { data: dynamicData = [] } = useTimeseriesUniqueValuesByProperty({
    property,
    query,
    advancedFilter: mapFiltersToTimeseriesAdvancedFilters(
      omittedFilter,
      searchQuery
    ),
    /**
     * In asset detailed view, we need to filter events according to selected assetSubtreeIds.
     * But assetSubtreeIds not supported in advanced filter.
     * so we have to use filter for that.
     */
    filter: getAssetSubtreeIdFilter(omittedFilter),
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
