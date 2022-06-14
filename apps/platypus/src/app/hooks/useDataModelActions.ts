import { TOKENS } from '@platypus-app/di';
import { useQuery } from 'react-query';
import { useInjection } from './useInjection';
import { Notification } from '@platypus-app/components/Notification/Notification';

export const useDataModels = () => {
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);
  const fetchDataModels = async () => {
    const result = await dataModelsHandler.list();
    if (!result.isSuccess) {
      Notification({ type: 'error', message: result.error.message });
      throw result.error;
    }
    return result.getValue();
  };

  const query = useQuery('dataModelsList', fetchDataModels);

  return query;
};
