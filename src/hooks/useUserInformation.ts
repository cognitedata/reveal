import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { useQuery } from 'react-query';

export const useUserInformation = () => {
  return useQuery('user-info', getUserInformation);
};
