import { useMemo } from 'react';

import omit from 'lodash/omit';

import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

import { getAssetSubtreeIdFilter } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useTimeseriesMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToTimeseriesAdvancedFilters } from '../transformers';

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
    options: { keepPreviousData: true },
  });

  const omittedFilter = omit(filter, 'metadata');

  const { data: dynamicData = [] } = useTimeseriesMetadataKeysAggregateQuery({
    query,
    advancedFilter: mapFiltersToTimeseriesAdvancedFilters(
      omittedFilter,
      searchQuery
    ),
    filter: getAssetSubtreeIdFilter(omittedFilter),
    options: { keepPreviousData: true },
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
