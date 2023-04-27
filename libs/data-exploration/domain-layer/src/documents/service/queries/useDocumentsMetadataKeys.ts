import { InternalDocumentFilter } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import { mapFiltersToDocumentSearchFilters } from '../../internal';
import { useDocumentsMetadataKeysAggregateQuery } from './useDocumentsMetadataKeysAggregateQuery';

interface Props {
  query?: string;
  enabled?: boolean;
  filter?: InternalDocumentFilter;
}

export const useDocumentsMetadataKeys = ({
  query,
  filter,
  enabled,
}: Props = {}) => {
  const { data, ...rest } = useDocumentsMetadataKeysAggregateQuery({
    query,
    filter: filter ? mapFiltersToDocumentSearchFilters(filter) : undefined,
    options: {
      enabled,
    },
  });

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return { data: metadataKeys, ...rest };
};
