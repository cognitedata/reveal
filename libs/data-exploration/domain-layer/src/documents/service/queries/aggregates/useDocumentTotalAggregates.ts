import { useSDK } from '@cognite/sdk-provider';
import { DocumentsAggregateAllUniqueValuesRequest } from '@cognite/sdk/dist/src';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import { useQuery } from '@tanstack/react-query';
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
