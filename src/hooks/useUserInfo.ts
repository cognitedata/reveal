import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { useQuery } from 'react-query';

export type UserInfo = {
  displayName: string;
  givenName: string;
  id: string;
  mail: string;
  userPricipalName: string;
};

export const useUserInfo = () => {
  const { data, isLoading, isFetched } = useQuery<UserInfo>(
    'user-info',
    getUserInformation
  );

  return { data, isLoading, isFetched };
};
