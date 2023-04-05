import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from 'react-query';
import { useTimeseriesMetadataValuesAggregateQuery } from '../../service';

export const useTimeseriesMetadataValuesOptionsQuery =
  (filter?: InternalTimeseriesFilters) =>
  (
    metadataKeys?: string | null,
    query?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useTimeseriesMetadataValuesAggregateQuery(
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
