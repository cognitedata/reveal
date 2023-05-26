import { useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { DocumentsAggregateAllUniqueValuesRequest } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../../queryKeys';
import { getDocumentAggregates } from '../../network/getDocumentAggregates';

export const useDocumentTotalAggregates = (
  aggregates: DocumentsAggregateAllUniqueValuesRequest['properties']
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsTotalAggregates(aggregates),
    () => {
      if (isEmpty(aggregates)) {
        return undefined;
      }

      return getDocumentAggregates(
        {
          properties: aggregates,
          limit: 10000,
        },
        sdk
      );
    },
    {
      enabled: !isEmpty(aggregates),
    }
  );
};
