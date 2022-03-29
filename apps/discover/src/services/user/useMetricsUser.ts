import { useUserInfo } from '../userManagementService/query';

export const useMetricsUser = () => {
  const { data: user } = useUserInfo();

  const userId = user?.id;
  const email = user?.email;

  const names: string[] = [];
  if (user?.displayName) {
    names.push(user?.displayName);
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
