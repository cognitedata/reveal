import { useQuery } from '@tanstack/react-query';

import { getUserInformation } from '@cognite/cdf-sdk-singleton';

export const useUserInfo = () => {
  const {
    data: userInfoData,
    isLoading,
    isFetched,
  } = useQuery(['user-info'], getUserInformation);

  const data = {
    displayName: userInfoData?.displayName,
    email: userInfoData?.mail,
    id: userInfoData?.id,
  };

  return { data, isLoading, isFetched };
};
