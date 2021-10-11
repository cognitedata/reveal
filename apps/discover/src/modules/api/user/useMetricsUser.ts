import { useAuthContext } from '@cognite/react-container';

import { useUserProfileQuery } from './useUserQuery';

export const useMetricsUser = () => {
  const user = useUserProfileQuery();
  const { authState } = useAuthContext();

  const userId = user?.data?.id;
  const email = authState?.email;

  const names: string[] = [];
  if (user?.data?.firstname) {
    names.push(user?.data?.firstname);
  }
  if (user?.data?.lastname) {
    names.push(user?.data?.lastname);
  }
  if (names.length === 0 && email) {
    names.push(email);
  }

  const mixpanelUser: { [key: string]: string } = {};
  if (names.length > 0) {
    mixpanelUser.$name = names.join(' ');
  }

  if (email) {
    mixpanelUser.$email = email;
  }

  if (Object.keys(mixpanelUser).length > 0) {
    return {
      userId,
      mixpanelUser,
    };
  }

  return {
    userId,
  };
};
