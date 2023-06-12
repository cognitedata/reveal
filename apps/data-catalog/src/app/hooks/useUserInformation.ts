import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { useQuery } from '@tanstack/react-query';

export const useUserInformation = () => {
  return useQuery(['user-info'], getUserInformation);
};
