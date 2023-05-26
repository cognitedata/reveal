import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../../queryKeys';
import { getDocumentAggregateCount } from '../../network/getDocumentAggregateCount';

export const useDocumentTotalAggregateCount = () => {
  const sdk = useSDK();

  return useQuery(queryKeys.documentsAggregatesCountTotal(), () => {
    return getDocumentAggregateCount({}, sdk);
  });
};
