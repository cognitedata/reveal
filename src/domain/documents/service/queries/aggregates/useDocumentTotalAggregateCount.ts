import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from 'domain/queryKeys';
import { useQuery } from 'react-query';
import { getDocumentAggregateCount } from '../../network/getDocumentAggregateCount';

export const useDocumentTotalAggregateCount = () => {
  const sdk = useSDK();

  return useQuery(queryKeys.documentsAggregatesCountTotal(), () => {
    return getDocumentAggregateCount({}, sdk);
  });
};
