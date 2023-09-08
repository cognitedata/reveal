import { useQuery } from '@tanstack/react-query';

import { getUserInformation } from '@cognite/cdf-sdk-singleton';

interface UserInfo {
  businessPhones: string[];
  displayName: string;
  givenName: string;
  id: string;
  jobTitle: string | null;
  mail: string;
  mobilePhone: string | null;
  officeLocation: string | null;
  preferredLanguage: string | null;
  surname: string;
  userPricipalNam: string;
}

export const useUserInfo = () => {
  const { data, isLoading, isFetched } = useQuery<UserInfo>(
    ['user-info'],
    getUserInformation
  );

  return { data, isLoading, isFetched };
};
