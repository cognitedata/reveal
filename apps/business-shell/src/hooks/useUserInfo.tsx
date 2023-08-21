import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '../app/common/auth/AuthProvider';
import { AuthStateUser } from '../app/common/auth/types';

export const useUserInfo = () => {
  const auth = useAuthContext();

  return useQuery<AuthStateUser>(
    ['user-info', auth.authState.user],
    () => auth.authState.user
  );
};
