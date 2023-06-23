import { useQuery } from '@tanstack/react-query';

import { User, useAuth } from '@cognite/auth-react';

export const useUserInfo = () => {
  const { getUser } = useAuth();

  return useQuery<User>(['user-info'], () => getUser());
};
