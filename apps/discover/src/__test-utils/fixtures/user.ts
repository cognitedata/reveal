import { UMSUserProfile } from '@cognite/user-management-service-types';

import { getEmail, getAnotherUser } from '__test-utils/testdata.utils';

export const getUser = (extras: Partial<UMSUserProfile> = {}) => {
  const email = getEmail();
  return <UMSUserProfile>{
    id: getAnotherUser(email),
    email,
    displayName: '',
    ...extras,
  };
};
