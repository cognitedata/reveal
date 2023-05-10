import { InternalSequenceFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from 'react-query';
import { useSequencesMetadataValuesAggregateQuery } from '../../service';
import { mapFiltersToSequenceAdvancedFilters } from '../transformers';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { getAssetSubtreeIdFilter } from '../../../utils';

interface Props {
  searchQuery?: string;
  filter?: InternalSequenceFilters;
}

export const useSequenceMetadataValuesOptionsQuery =
  ({ searchQuery, filter }: Props = {}) =>
  (
    metadataKeys?: string | null,
    query?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data = [], isLoading } = useSequencesMetadataValuesAggregateQuery({
      metadataKey: metadataKeys,
      query,
      options,
    });

    const omittedFilter = omit(filter, 'metadata');

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dynamicData = [] } = useSequencesMetadataValuesAggregateQuery(
      {
        metadataKey: metadataKeys,
        query,
        options,
        advancedFilter: mapFiltersToSequenceAdvancedFilters(
          omittedFilter,
          searchQuery
        ),
        filter: getAssetSubtreeIdFilter(omittedFilter),
      }
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transformedOptions = useMemo(() => {
      return mergeDynamicFilterOptions(data, dynamicData);
    }, [data, dynamicData]);

    return { options: transformedOptions, isLoading };
  };
