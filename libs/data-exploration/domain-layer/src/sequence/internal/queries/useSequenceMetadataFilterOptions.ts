import { useMemo } from 'react';

import { InternalSequenceFilters } from '@data-exploration-lib/core';
import omit from 'lodash/omit';

import { getAssetSubtreeIdFilter } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useSequencesMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToSequenceAdvancedFilters } from '../transformers';

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
