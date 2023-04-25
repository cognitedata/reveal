import { InternalSequenceFilters } from '@data-exploration-lib/core';
import { useSequencesMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToSequenceAdvancedFilters } from '../transformers';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  filter?: InternalSequenceFilters;
  searchQuery?: string;
  query?: string;
}

export const useSequenceMetadataFilterOptions = ({
  searchQuery,
  filter,
  query,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useSequencesMetadataKeysAggregateQuery({
    query,
  });

  const { data: dynamicData = [] } = useSequencesMetadataKeysAggregateQuery({
    query,
    advancedFilter: mapFiltersToSequenceAdvancedFilters(
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
