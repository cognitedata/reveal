import { User } from '@cognite/discover-api-types';

import { getEmail, getAnotherUser } from '__test-utils/testdata.utils';

export const getUser = (extras: Partial<User> = {}) => {
  const email = getEmail();
  return <User>{
    id: getAnotherUser(email),
    email,
    firstname: '',
    lastname: '',
    ...extras,
  };
};
