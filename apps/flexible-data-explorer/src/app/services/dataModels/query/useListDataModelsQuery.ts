import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { FDMClient } from '../../FDMClient';
import { queryKeys } from '../../queryKeys';

export const useListDataModelsQuery = () => {
  const sdk = useSDK();
  const client = new FDMClient(sdk);

  return useQuery(queryKeys.listDataModels(), async () => {
    return client.listDataModels();
  });
};
