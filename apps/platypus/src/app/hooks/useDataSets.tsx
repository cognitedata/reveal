import { useQuery } from 'react-query';
import { getCogniteSDKClient } from '../../environments/cogniteSdk';

export const useDataSets = () => {
  const cdfClient = getCogniteSDKClient();

  return useQuery(
    'dataSetsList',
    async () => await (await cdfClient.datasets.list()).items
  );
};
