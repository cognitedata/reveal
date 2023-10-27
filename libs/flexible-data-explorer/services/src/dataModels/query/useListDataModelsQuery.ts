import { BaseFDMClient } from '@fdx/shared/clients/FDMClientV2';
import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../queryKeys';

export const useListDataModelsQuery = () => {
  const sdk = useSDK();
  const client = new BaseFDMClient(sdk);

  return useQuery(queryKeys.listDataModels(), async () => {
    return client.listDataModels();
  });
};
