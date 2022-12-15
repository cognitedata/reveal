import { useSDK } from '@cognite/sdk-provider';
import { DocumentsAggregateAllUniqueValuesRequest } from '@cognite/sdk/dist/src';
import { queryKeys } from 'domain/queryKeys';
import { isEmpty } from 'lodash';
import { useQuery } from 'react-query';
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
