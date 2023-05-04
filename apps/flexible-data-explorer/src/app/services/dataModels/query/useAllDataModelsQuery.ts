import { useSDK } from '@cognite/sdk-provider';
import { Query, useQuery } from '@tanstack/react-query';
import { FDMClient } from '../../FDMClient';
import { listDataModels } from '../network/getAllDataModels';

export const useAllDataModelsQuery = () => {
  const sdk = useSDK();
  const client = new FDMClient(sdk);

  return useQuery(['data-models', 'all'], async () => {
    const result = await listDataModels(client);

    return result.listGraphQlDmlVersions.items;
  });
};
