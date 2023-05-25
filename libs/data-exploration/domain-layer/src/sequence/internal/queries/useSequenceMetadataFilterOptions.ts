import { InternalSequenceFilters } from '@data-exploration-lib/core';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { useSequencesMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToSequenceAdvancedFilters } from '../transformers';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { getAssetSubtreeIdFilter } from '../../../utils';

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

  const omittedFilter = omit(filter, 'metadata');
  const { data: dynamicData = [] } = useSequencesMetadataKeysAggregateQuery({
    query,
    advancedFilter: mapFiltersToSequenceAdvancedFilters(
      omittedFilter,
      searchQuery
    ),
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
