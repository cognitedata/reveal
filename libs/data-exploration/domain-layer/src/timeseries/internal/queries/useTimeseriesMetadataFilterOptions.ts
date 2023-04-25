import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import { useTimeseriesMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToTimeseriesAdvancedFilters } from '../transformers';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  filter?: InternalTimeseriesFilters;
  searchQuery?: string;
  query?: string;
}

export const useTimeseriesMetadataFilterOptions = ({
  searchQuery,
  filter,
  query,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useTimeseriesMetadataKeysAggregateQuery({
    query,
  });

  const { data: dynamicData = [] } = useTimeseriesMetadataKeysAggregateQuery({
    query,
    advancedFilter: mapFiltersToTimeseriesAdvancedFilters(
      omit(filter, 'metadata'),
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
