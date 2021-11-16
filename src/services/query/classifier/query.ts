import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { composeClassifierTrainingSets } from 'services/compose';
import { DOCUMENTS_QUERY_KEYS } from 'services/constants';

export const useClassifierManageTrainingSetsQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(
    DOCUMENTS_QUERY_KEYS.trainingSet,
    () => composeClassifierTrainingSets(sdk)
  );

  return { data, ...rest };
};
