import { useAssetsMetadataValuesAggregateQuery } from '../../service';
import { UseQueryOptions } from 'react-query';
import { InternalAssetFilters } from '@data-exploration-lib/core';

export const useAssetsMetadataValuesOptionsQuery =
  (filter?: InternalAssetFilters) =>
  (metadataKeys?: string | null, options?: UseQueryOptions<any>) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useAssetsMetadataValuesAggregateQuery(
      metadataKeys,
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
