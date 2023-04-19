import { useMemo } from 'react';

import { InternalDocumentFilter } from '@data-exploration-lib/core';

import omit from 'lodash/omit';

import {
  mapFiltersToDocumentSearchFilters,
  useDocumentsLabelAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { getSearchConfig } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';

interface Props {
  query?: string;
  filter?: InternalDocumentFilter;
  prefix?: string;
}

export const useDocumentsLabelsFilterOptions = ({
  query,
  filter = {},
  prefix,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useDocumentsLabelAggregateQuery({
    prefix,
  });

  const { data: dynamicData = [] } = useDocumentsLabelAggregateQuery({
    filter: mapFiltersToDocumentSearchFilters(
      omit(filter, 'labels'),
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
