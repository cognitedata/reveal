import { InternalEventsFilters } from '@data-exploration-lib/core';
import { useEventsMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToEventsAdvancedFilters } from '../transformers';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

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

  const { data: dynamicData = [] } = useEventsMetadataKeysAggregateQuery({
    query,
    advancedFilter: mapFiltersToEventsAdvancedFilters(
      omit(filter, 'metadata'),
      searchQuery
    ),
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
