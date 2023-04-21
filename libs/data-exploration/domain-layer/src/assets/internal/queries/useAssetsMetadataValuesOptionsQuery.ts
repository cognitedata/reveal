import { useAssetsMetadataValuesAggregateQuery } from '../../service';
import { UseQueryOptions } from 'react-query';
import { InternalAssetFilters } from '@data-exploration-lib/core';
import { mapFiltersToAssetsAdvancedFilters } from '../transformers';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  query?: string;
  filter?: InternalAssetFilters;
}

export const useAssetsMetadataValuesOptionsQuery =
  ({ query, filter }: Props) =>
  (
    metadataKey?: string | null,
    prefix?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data = [], isLoading } = useAssetsMetadataValuesAggregateQuery({
      metadataKey,
      prefix,
      options,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dynamicData = [] } = useAssetsMetadataValuesAggregateQuery({
      metadataKey,
      prefix,
      advancedFilter: mapFiltersToAssetsAdvancedFilters(
        omit(filter, 'metadata'),
        query
      ),
      options,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transformedOptions = useMemo(() => {
      return mergeDynamicFilterOptions(data, dynamicData);
    }, [data, dynamicData]);

    return { options: transformedOptions, isLoading };
  };
