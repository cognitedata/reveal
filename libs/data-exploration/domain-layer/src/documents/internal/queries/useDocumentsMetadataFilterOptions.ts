import { InternalDocumentFilter } from '@data-exploration-lib/core';

import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useDocumentsMetadataKeysAggregateQuery } from '../../service';
import { mapFiltersToDocumentSearchFilters } from '../transformers';

interface Props {
  query?: string;
  searchQuery?: string;
  filter?: InternalDocumentFilter;
}

export const useDocumentsMetadataFilterOptions = ({
  query,
  searchQuery,
  filter,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useDocumentsMetadataKeysAggregateQuery({
    query,
  });

  const { data: dynamicData = [] } = useDocumentsMetadataKeysAggregateQuery({
    filter: mapFiltersToDocumentSearchFilters(
      omit(filter, 'metadata'),
      searchQuery
    ),
    query,
  });

  const options = useMemo(() => {
    return mergeDynamicFilterOptions(data, dynamicData);
  }, [data, dynamicData]);

  return {
    options,
    isLoading,
    isError,
  };
};
