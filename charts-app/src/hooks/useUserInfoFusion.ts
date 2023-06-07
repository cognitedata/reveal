import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { useQuery } from 'react-query';

export const useUserInfo = () => {
  const {
    data: userInfoData,
    isLoading,
    isFetched,
  } = useQuery('user-info', getUserInformation);

  const data = {
    displayName: userInfoData.displayName,
    email: userInfoData.email,
    id: userInfoData.id,
  };

  return { data, isLoading, isFetched };
};
