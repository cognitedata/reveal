import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from 'react-query';
import { useTimeseriesMetadataValuesAggregateQuery } from '../../service';
import omit from 'lodash/omit';
import { mapFiltersToTimeseriesAdvancedFilters } from '../transformers';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useMemo } from 'react';

interface Props {
  filter?: InternalTimeseriesFilters;
  searchQuery?: string;
}

export const useTimeseriesMetadataValuesOptionsQuery =
  ({ filter, searchQuery }: Props) =>
  (
    metadataKeys?: string | null,
    query?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data = [], isLoading } = useTimeseriesMetadataValuesAggregateQuery({
      metadataKey: metadataKeys,
      query,
      options,
    });

    const { data: dynamicData = [] } =
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useTimeseriesMetadataValuesAggregateQuery({
        metadataKey: metadataKeys,
        query,
        options,
        advancedFilter: mapFiltersToTimeseriesAdvancedFilters(
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
