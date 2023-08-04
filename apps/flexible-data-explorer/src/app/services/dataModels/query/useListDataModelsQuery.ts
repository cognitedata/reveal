import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { BaseFDMClient } from '../../FDMClientV2';
import { queryKeys } from '../../queryKeys';

export const useListDataModelsQuery = () => {
  const sdk = useSDK();
  const client = new BaseFDMClient(sdk);

  return useQuery(queryKeys.listDataModels(), async () => {
    return client.listDataModels();
  });
};
