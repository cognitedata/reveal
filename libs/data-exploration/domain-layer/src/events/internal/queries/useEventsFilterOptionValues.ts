import { useMemo } from 'react';

import omit from 'lodash/omit';

import { InternalEventsFilters } from '@data-exploration-lib/core';

import { getAssetSubtreeIdFilter } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useEventsMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToEventsAdvancedFilters } from '../transformers';

interface Props {
  filter?: InternalEventsFilters;
  searchQuery?: string;
  query?: string;
}

export const useEventsFilterOptionValues = ({
  filter,
  searchQuery,
  query,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useEventsMetadataKeysAggregateQuery({
    query,
    options: { keepPreviousData: true },
  });

  const omittedFilter = omit(filter, 'metadata');

  const { data: dynamicData = [] } = useEventsMetadataKeysAggregateQuery({
    query,
    advancedFilter: mapFiltersToEventsAdvancedFilters(
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
