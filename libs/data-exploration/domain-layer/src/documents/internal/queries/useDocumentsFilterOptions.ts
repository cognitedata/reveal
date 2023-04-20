import { useMemo } from 'react';

import { InternalDocumentFilter } from '@data-exploration-lib/core';

import omit from 'lodash/omit';

import {
  mapFiltersToDocumentSearchFilters,
  useDocumentsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { getSearchConfig } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { DocumentProperty, DocumentSourceProperty } from '../../service/types';

interface Props {
  property: Exclude<DocumentProperty, 'labels'> | DocumentSourceProperty;
  query?: string;
  filter?: InternalDocumentFilter;
  prefix?: string;
}

export const useDocumentsFilterOptions = ({
  property,
  query,
  filter = {},
  prefix,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useDocumentsUniqueValuesByProperty({
    property,
    prefix,
  });

  const { data: dynamicData = [] } = useDocumentsUniqueValuesByProperty({
    property,
    filter: mapFiltersToDocumentSearchFilters(
      omit(filter, property),
      query,
      getSearchConfig().file
    ),
    prefix,
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
