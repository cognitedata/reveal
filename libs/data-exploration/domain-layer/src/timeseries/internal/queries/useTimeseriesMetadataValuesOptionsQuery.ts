import { useMemo } from 'react';

import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from '@tanstack/react-query';
import omit from 'lodash/omit';

import { getAssetSubtreeIdFilter } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useTimeseriesMetadataValuesAggregateQuery } from '../../service';
import { mapFiltersToTimeseriesAdvancedFilters } from '../transformers';

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

    const omittedFilter = omit(filter, 'metadata');

    const { data: dynamicData = [] } =
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useTimeseriesMetadataValuesAggregateQuery({
        metadataKey: metadataKeys,
        query,
        options,
        advancedFilter: mapFiltersToTimeseriesAdvancedFilters(
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
