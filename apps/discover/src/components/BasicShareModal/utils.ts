import { FormattedSharedUser, SharedUser } from './types';

export const getFormattedUsers = (
  users: SharedUser[]
): FormattedSharedUser[] => {
  return users.map((user) => {
    const { firstname = '', lastname = '' } = user;
    return {
      id: user.id,
      email: user.email,
      iconCode: `${firstname.substring(0, 1)}${lastname.substring(
        0,
        1
      )}`.toUpperCase(),
      fullName: `${firstname || ''} ${lastname}`,
    };
  });
};
