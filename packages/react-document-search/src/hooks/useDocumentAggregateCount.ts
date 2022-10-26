import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DocumentSearchContext } from '../providers';
import { getDocumentAggregateCount } from '../api/aggregates';

export const useDocumentAggregateCount = () => {
  const { sdkClient } = useContext(DocumentSearchContext);

  return useQuery(
    ['documents', 'aggregates', 'count', 'total'],
    () => {
      return getDocumentAggregateCount({}, sdkClient!);
    },
    {
      enabled: Boolean(sdkClient),
    }
  );
};
