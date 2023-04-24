import { InternalSequenceFilters } from '@data-exploration-lib/core';
import { useSequencesMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToSequenceAdvancedFilters } from '../transformers';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  filter?: InternalSequenceFilters;
  query?: string;
  prefix?: string;
}

export const useSequenceMetadataFilterOptions = ({
  query,
  filter,
  prefix,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useSequencesMetadataKeysAggregateQuery({
    prefix,
  });

  const { data: dynamicData = [] } = useSequencesMetadataKeysAggregateQuery({
    prefix,
    advancedFilter: mapFiltersToSequenceAdvancedFilters(
      omit(filter, 'metadata'),
      query
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
