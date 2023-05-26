import { useMemo } from 'react';

import { InternalDocumentFilter } from '@data-exploration-lib/core';
import { UseQueryOptions } from '@tanstack/react-query';
import omit from 'lodash/omit';

import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useDocumentsMetadataValuesAggregateQuery } from '../../service';
import { mapFiltersToDocumentSearchFilters } from '../transformers';

interface Props {
  searchQuery?: string;
  filter?: InternalDocumentFilter;
}

export const useDocumentMetadataValuesOptionsQuery =
  ({ searchQuery, filter }: Props) =>
  (
    metadataKey?: string | null,
    query?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data = [], isLoading } = useDocumentsMetadataValuesAggregateQuery({
      metadataKey,
      query,
      options,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dynamicData = [] } = useDocumentsMetadataValuesAggregateQuery(
      {
        metadataKey,
        query,
        filter: mapFiltersToDocumentSearchFilters(
          omit(filter, 'metadata'),
          searchQuery
        ),
        options,
      }
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const transformedOptions = useMemo(() => {
      return mergeDynamicFilterOptions(data, dynamicData);
    }, [data, dynamicData]);

    return { options: transformedOptions, isLoading };
  };
