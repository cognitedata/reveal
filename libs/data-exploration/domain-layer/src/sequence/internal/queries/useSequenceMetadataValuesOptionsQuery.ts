import { InternalSequenceFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from 'react-query';
import { useSequencesMetadataValuesAggregateQuery } from '../../service';

export const useSequenceMetadataValuesOptionsQuery =
  (filter?: InternalSequenceFilters) =>
  (
    metadataKeys?: string | null,
    query?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useSequencesMetadataValuesAggregateQuery(
      metadataKeys,
      query,
      filter,
      options
    );

    const transFormedOptions = (data || []).map((item) => ({
      label: item.values[0],
      value: item.values[0],
      count: item.count,
    }));

    return { options: transFormedOptions, isLoading };
  };
