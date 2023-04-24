import { InternalSequenceFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from 'react-query';
import { useSequencesMetadataValuesAggregateQuery } from '../../service';
import { mapFiltersToSequenceAdvancedFilters } from '../transformers';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  filter?: InternalSequenceFilters;
  query?: string;
}

export const useSequenceMetadataValuesOptionsQuery =
  ({ filter, query }: Props = {}) =>
  (
    metadataKeys?: string | null,
    prefix?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data = [], isLoading } = useSequencesMetadataValuesAggregateQuery({
      metadataKey: metadataKeys,
      prefix,
      options,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dynamicData = [] } = useSequencesMetadataValuesAggregateQuery(
      {
        metadataKey: metadataKeys,
        prefix,
        options,
        advancedFilter: mapFiltersToSequenceAdvancedFilters(
          omit(filter, 'metadata'),
          query
        ),
      }
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transformedOptions = useMemo(() => {
      return mergeDynamicFilterOptions(data, dynamicData);
    }, [data, dynamicData]);

    return { options: transformedOptions, isLoading };
  };
