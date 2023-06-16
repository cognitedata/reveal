import { useQuery } from '@tanstack/react-query';

import { getUserInfo } from '../../environments/cogniteSdk';

export const useUserInformation = () => {
  return useQuery(['user-info'], () => getUserInfo());
};
