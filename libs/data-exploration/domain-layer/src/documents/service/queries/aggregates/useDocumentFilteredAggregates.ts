import { useSDK } from '@cognite/sdk-provider';
import { DocumentsAggregateAllUniqueValuesRequest } from '@cognite/sdk/dist/src';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import { useQuery } from 'react-query';
import { getDocumentAggregates } from '../../network/getDocumentAggregates';
import { useMemo } from 'react';
import { mapFiltersToDocumentSearchFilters } from '@data-exploration-lib/domain-layer';
import {
  EMPTY_OBJECT,
  InternalDocumentFilter,
} from '@data-exploration-lib/core';

export const useDocumentFilteredAggregates = (
  aggregates: DocumentsAggregateAllUniqueValuesRequest['properties'],
  filters: InternalDocumentFilter = EMPTY_OBJECT,
  query?: string
) => {
  const sdk = useSDK();

  const transformFilter = useMemo(
    () => mapFiltersToDocumentSearchFilters(filters, query),
    [filters, query]
  );
  return useQuery(
    queryKeys.documentsFilteredAggregates(filters, aggregates),
    () => {
      return getDocumentAggregates(
        {
          properties: aggregates,
          limit: 10000,
          filter: transformFilter as any,
        },
        sdk
      );
    },
    {
      enabled: !isEmpty(aggregates),
    }
  );
};
