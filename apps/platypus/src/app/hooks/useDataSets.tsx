import { useQuery } from '@tanstack/react-query';

import { getCogniteSDKClient } from '../../environments/cogniteSdk';
import { QueryKeys } from '../utils/queryKeys';

export const useDataSets = () => {
  const cdfClient = getCogniteSDKClient();

  return useQuery(QueryKeys.DATA_SETS_LIST, async () => {
    return (await cdfClient.datasets.list().autoPagingToArray()).filter(
      (el) => !el.metadata || !el.metadata['archived']
    );
  });
};
