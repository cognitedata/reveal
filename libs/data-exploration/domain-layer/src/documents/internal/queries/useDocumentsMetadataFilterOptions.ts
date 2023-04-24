import { InternalDocumentFilter } from '@data-exploration-lib/core';
import {
  mapFiltersToDocumentSearchFilters,
  useDocumentsMetadataKeysAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import omit from 'lodash/omit';
import { useMemo } from 'react';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  prefix?: string;
  query?: string;
  filter?: InternalDocumentFilter;
}

export const useDocumentsMetadataFilterOptions = ({
  prefix,
  query,
  filter,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useDocumentsMetadataKeysAggregateQuery({
    prefix,
  });

  const { data: dynamicData = [] } = useDocumentsMetadataKeysAggregateQuery({
    filter: mapFiltersToDocumentSearchFilters(omit(filter, 'metadata'), query),
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
