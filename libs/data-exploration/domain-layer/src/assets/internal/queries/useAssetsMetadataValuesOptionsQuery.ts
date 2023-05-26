import { useMemo } from 'react';

import { InternalAssetFilters } from '@data-exploration-lib/core';
import { UseQueryOptions } from '@tanstack/react-query';
import omit from 'lodash/omit';

import { getAssetSubtreeIdFilter } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useAssetsMetadataValuesAggregateQuery } from '../../service';
import { mapFiltersToAssetsAdvancedFilters } from '../transformers';

interface Props {
  searchQuery?: string;
  filter?: InternalAssetFilters;
}

export const useAssetsMetadataValuesOptionsQuery =
  ({ searchQuery, filter }: Props) =>
  (
    metadataKey?: string | null,
    query?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data = [], isLoading } = useAssetsMetadataValuesAggregateQuery({
      metadataKey,
      query,
      options,
    });

    const omittedFilter = omit(filter, 'metadata');

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dynamicData = [] } = useAssetsMetadataValuesAggregateQuery({
      metadataKey,
      query,
      advancedFilter: mapFiltersToAssetsAdvancedFilters(
        omittedFilter,
        searchQuery
      ),
      filter: getAssetSubtreeIdFilter(omittedFilter),
      options,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transformedOptions = useMemo(() => {
      return mergeDynamicFilterOptions(data, dynamicData);
    }, [data, dynamicData]);

    return { options: transformedOptions, isLoading };
  };
