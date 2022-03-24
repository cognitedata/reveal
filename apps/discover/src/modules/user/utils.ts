import { User, UserInfoSummary } from '@cognite/discover-api-types';

export const getFullUserName = (user: Partial<User>) => {
  if (!user.firstname) {
    return user.email || 'Missing email';
  }

  return (user.firstname || '') + (user.lastname ? ` ${user.lastname}` : '');
};

export const getFullNameOrDefaultText = (
  user: Omit<UserInfoSummary, 'id'> | undefined
) => {
  // No user is given (shows a line)
  if (!user) {
    return '';
  }

  // If we have a part of the name, show it (first name, last name or both)
  if (user.firstname || user.lastname) {
    return [user.firstname, user.lastname].join(' ').trim();
  }

  // Alternatively we can show the email
  if (user.email) {
    return user.email.toLowerCase();
  }

  // There is a user, but we don't have any user-friendly data to show
  return 'Unknown';
};
