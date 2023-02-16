import { useQuery } from 'react-query';
import { getUserInformation } from 'utils/cogniteSdk';

export const useUserInformation = () => {
  return useQuery('user-info', getUserInformation);
};
