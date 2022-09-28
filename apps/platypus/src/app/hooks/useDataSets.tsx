import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQuery } from 'react-query';
import { getCogniteSDKClient } from '../../environments/cogniteSdk';

export const useDataSets = () => {
  const cdfClient = getCogniteSDKClient();

  return useQuery(
    QueryKeys.DATA_SETS_LIST,
    async () => await (await cdfClient.datasets.list()).items
  );
};
