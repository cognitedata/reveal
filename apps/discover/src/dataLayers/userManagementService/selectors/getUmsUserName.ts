import { UMSUser } from '@cognite/user-management-service-types';

export const getUmsUserName = (user: UMSUser, currentUserId = ''): string => {
  const userName = user.displayName || user.email || 'Unknown';

  if (user.id && user.id === currentUserId) return `${userName} (you)`;
  return userName;
};
