import { useMemo } from 'react';

import { InternalAssetFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from '@tanstack/react-query';
import omit from 'lodash/omit';

import { getAssetSubtreeIdFilter } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useEventsMetadataValuesAggregateQuery } from '../../service';
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

    const omittedFilter = omit(filter, 'metadata');

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dynamicData = [] } = useEventsMetadataValuesAggregateQuery({
      metadataKey: metadataKeys,
      query,
      options,
      advancedFilter: mapFiltersToEventsAdvancedFilters(
        omittedFilter,
        searchQuery
      ),
      filter: getAssetSubtreeIdFilter(omittedFilter),
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transformedOptions = useMemo(() => {
      return mergeDynamicFilterOptions(data, dynamicData);
    }, [data, dynamicData]);

    return { options: transformedOptions, isLoading };
  };
