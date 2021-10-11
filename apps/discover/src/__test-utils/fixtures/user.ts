import { getEmail, getAnotherUser } from '__test-utils/testdata.utils';
import { User } from 'modules/user/types';

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
