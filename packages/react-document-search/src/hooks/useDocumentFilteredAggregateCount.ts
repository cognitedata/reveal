import { useContext } from 'react';
import { useQuery } from 'react-query';

import { DocumentSearchContext } from '../providers';
import { getDocumentAggregateCount } from '../api/aggregates';

import { useDocumentFilters } from './useDocumentFilters';

export const useDocumentFilteredAggregateCount = () => {
  const { sdkClient } = useContext(DocumentSearchContext);
  const { appliedFilters } = useDocumentFilters();

  return useQuery(
    ['documents', 'aggregates', 'count', appliedFilters],
    () => {
      return getDocumentAggregateCount(
        {
          filter: appliedFilters.filter,
          search: appliedFilters.search,
        },
        sdkClient!
      );
    },
    {
      enabled: Boolean(sdkClient),
    }
  );
};
