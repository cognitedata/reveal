import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import { DocumentsAggregateAllUniqueValuesRequest } from '@cognite/sdk';

import { DocumentSearchContext } from '../providers';
import { getDocumentAggregates } from '../api/aggregates';

import { useDocumentFilters } from './useDocumentFilters';

export const useDocumentFilteredAggregates = (
  aggregates: DocumentsAggregateAllUniqueValuesRequest['properties']
) => {
  const { sdkClient } = useContext(DocumentSearchContext);
  const { appliedFilters } = useDocumentFilters();

  return useQuery(
    ['documents', 'aggregates', appliedFilters, aggregates],
    () => {
      return getDocumentAggregates(
        {
          properties: aggregates,
          limit: 10000,
          filter: appliedFilters.filter,
          search: appliedFilters.search,
        },
        sdkClient!
      );
    },
    {
      enabled: Boolean(sdkClient) && !isEmpty(aggregates),
    }
  );
};
