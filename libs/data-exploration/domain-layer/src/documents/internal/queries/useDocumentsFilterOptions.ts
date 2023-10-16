import { useMemo } from 'react';

import omit from 'lodash/omit';

import {
  InternalDocumentFilter,
  mergeInternalFilters,
} from '@data-exploration-lib/core';

import { pickFilterDataByDefaultFilter } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { useDocumentsUniqueValuesByProperty } from '../../service';
import { DocumentProperty, DocumentSourceProperty } from '../../service/types';
import { mapFiltersToDocumentSearchFilters } from '../transformers';

interface Props {
  property: Exclude<DocumentProperty, 'labels'> | DocumentSourceProperty;
  searchQuery?: string;
  filter?: InternalDocumentFilter;
  defaultFilter?: InternalDocumentFilter;
  query?: string;
}

export const useDocumentsFilterOptions = ({
  property,
  searchQuery,
  filter = {},
  defaultFilter = {},
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
      mergeInternalFilters(omit(filter, property), defaultFilter),
      searchQuery
    ),
    query,
  });

  const filterData = useMemo(() => {
    return pickFilterDataByDefaultFilter(data, defaultFilter, property);
  }, [data, defaultFilter, property]);

  const options = useMemo(() => {
    return mergeDynamicFilterOptions(filterData, dynamicData);
  }, [filterData, dynamicData]);

  return {
    options,
    isLoading,
    isError,
  };
};
