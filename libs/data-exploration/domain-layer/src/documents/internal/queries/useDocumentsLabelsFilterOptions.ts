import { useMemo } from 'react';

import omit from 'lodash/omit';

import { InternalDocumentFilter } from '@data-exploration-lib/core';

import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useDocumentsLabelAggregateQuery } from '../../service';
import { mapFiltersToDocumentSearchFilters } from '../transformers';

interface Props {
  searchQuery?: string;
  filter?: InternalDocumentFilter;
  query?: string;
}

export const useDocumentsLabelsFilterOptions = ({
  searchQuery,
  filter = {},
  query,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useDocumentsLabelAggregateQuery({
    query,
  });

  const { data: dynamicData = [] } = useDocumentsLabelAggregateQuery({
    filter: mapFiltersToDocumentSearchFilters(
      omit(filter, 'labels'),
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
