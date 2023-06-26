import { useQuery } from '@tanstack/react-query';

import { getUserInformation } from '@cognite/cdf-sdk-singleton';

export const useUserInfo = () => {
  const { data, isLoading, isFetched } = useQuery(
    ['user-info'],
    getUserInformation
  );

  return { data, isLoading, isFetched };
};
