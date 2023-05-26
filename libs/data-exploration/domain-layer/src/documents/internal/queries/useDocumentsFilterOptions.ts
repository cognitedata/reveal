import { useMemo } from 'react';

import { InternalDocumentFilter } from '@data-exploration-lib/core';
import omit from 'lodash/omit';

import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useDocumentsUniqueValuesByProperty } from '../../service';
import { DocumentProperty, DocumentSourceProperty } from '../../service/types';
import { mapFiltersToDocumentSearchFilters } from '../transformers';

interface Props {
  property: Exclude<DocumentProperty, 'labels'> | DocumentSourceProperty;
  searchQuery?: string;
  filter?: InternalDocumentFilter;
  query?: string;
}

export const useDocumentsFilterOptions = ({
  property,
  searchQuery,
  filter = {},
  query,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useDocumentsUniqueValuesByProperty({
    property,
    query,
  });

  const { data: dynamicData = [] } = useDocumentsUniqueValuesByProperty({
    property,
    filter: mapFiltersToDocumentSearchFilters(
      omit(filter, property),
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
