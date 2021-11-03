import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { composeClassifierTrainingSets } from 'services/compose';
import { CLASSIFIER_QUERY_KEYS } from 'services/constants';

export const useClassifierManageTrainingSetsQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(
    CLASSIFIER_QUERY_KEYS.list,
    () => composeClassifierTrainingSets(sdk),
    {
      staleTime: Infinity,
    }
  );

  return { data, ...rest };
};
