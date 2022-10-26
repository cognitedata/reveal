import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import { DocumentsAggregateAllUniqueValuesRequest } from '@cognite/sdk';

import { DocumentSearchContext } from '../providers';
import { getDocumentAggregates } from '../api/aggregates';

export const useDocumentTotalAggregates = (
  aggregates: DocumentsAggregateAllUniqueValuesRequest['properties']
) => {
  const { sdkClient } = useContext(DocumentSearchContext);

  return useQuery(
    ['documents', 'aggregates', 'total', aggregates],
    () => {
      if (isEmpty(aggregates)) {
        return undefined;
      }

      return getDocumentAggregates(
        {
          properties: aggregates,
          limit: 10000,
        },
        sdkClient!
      );
    },
    {
      enabled: Boolean(sdkClient) && !isEmpty(aggregates),
    }
  );
};
