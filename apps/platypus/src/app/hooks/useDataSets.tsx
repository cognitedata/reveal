import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQuery } from '@tanstack/react-query';

import { getCogniteSDKClient } from '../../environments/cogniteSdk';

export const useDataSets = () => {
  const cdfClient = getCogniteSDKClient();

  return useQuery(QueryKeys.DATA_SETS_LIST, async () => {
    return (await cdfClient.datasets.list().autoPagingToArray()).filter(
      (el) => !el.metadata || !el.metadata['archived']
    );
  });
};
