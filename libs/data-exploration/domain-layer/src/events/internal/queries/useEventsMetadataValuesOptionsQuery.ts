import { InternalAssetFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from 'react-query';
import { useEventsMetadataValuesAggregateQuery } from '../../service';
import omit from 'lodash/omit';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useMemo } from 'react';
import { mapFiltersToEventsAdvancedFilters } from '../transformers';

interface Props {
  filter?: InternalAssetFilters;
  searchQuery?: string;
}

export const useEventsMetadataValuesOptionsQuery =
  ({ filter, searchQuery }: Props) =>
  (
    metadataKeys?: string | null,
    query?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data = [], isLoading } = useEventsMetadataValuesAggregateQuery({
      metadataKey: metadataKeys,
      query,
      options,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dynamicData = [] } = useEventsMetadataValuesAggregateQuery({
      metadataKey: metadataKeys,
      query,
      options,
      advancedFilter: mapFiltersToEventsAdvancedFilters(
        omit(filter, 'metadata'),
        searchQuery
      ),
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transformedOptions = useMemo(() => {
      return mergeDynamicFilterOptions(data, dynamicData);
    }, [data, dynamicData]);

    return { options: transformedOptions, isLoading };
  };
