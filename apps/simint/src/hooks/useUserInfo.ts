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
  userPrincipalName: string;
}

const getUserInformationInternal = async (): Promise<UserInfo> => {
  return new Promise((resolve) => {
    const user: UserInfo = {
      businessPhones: [],
      displayName: 'Test User',
      givenName: 'Test',
      id: '123456789',
      jobTitle: null,
      mail: 'test@test.test',
      mobilePhone: null,
      officeLocation: null,
      preferredLanguage: null,
      surname: 'User',
      userPrincipalName: '',
    };

    resolve(user);
  });
};

export const useUserInfo = () => {
  const { data, isLoading, isFetched } = useQuery<UserInfo>(
    ['user-info'],
    // @ts-expect-error
    window.Cypress ? getUserInformationInternal : getUserInformation
  );

  return { data, isLoading, isFetched };
};
