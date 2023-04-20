import { InternalAssetFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from 'react-query';
import { useEventsMetadataValuesAggregateQuery } from '../../service';

export const useEventsMetadataValuesOptionsQuery =
  (filter?: InternalAssetFilters) =>
  (
    metadataKeys?: string | null,
    query?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useEventsMetadataValuesAggregateQuery(
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
