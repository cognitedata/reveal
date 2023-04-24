import { InternalDocumentFilter } from '@data-exploration-lib/core';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { UseQueryOptions } from 'react-query';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useDocumentsMetadataValuesAggregateQuery } from '../../service';
import { mapFiltersToDocumentSearchFilters } from '../transformers';

interface Props {
  query?: string;
  filter?: InternalDocumentFilter;
}

export const useDocumentMetadataValuesOptionsQuery =
  ({ query, filter }: Props) =>
  (
    metadataKey?: string | null,
    prefix?: string,
    options?: UseQueryOptions<any>
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data = [], isLoading } = useDocumentsMetadataValuesAggregateQuery({
      metadataKey,
      prefix,
      options,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dynamicData = [] } = useDocumentsMetadataValuesAggregateQuery(
      {
        metadataKey,
        prefix,
        filter: mapFiltersToDocumentSearchFilters(
          omit(filter, 'metadata'),
          query
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
