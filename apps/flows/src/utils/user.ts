import { QueryClient, useQuery } from '@tanstack/react-query';

import { getUserInformation } from '@cognite/cdf-sdk-singleton';

export const userInfoKey = () => ['user-info'];

export const useUserInfo = () => useQuery(userInfoKey(), getUserInformation);
export const getUserInfo = (queryClient: QueryClient) =>
  queryClient.fetchQuery(userInfoKey(), getUserInformation);
