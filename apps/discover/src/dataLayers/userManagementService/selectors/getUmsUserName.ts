import { UMSUser } from '@cognite/user-management-service-types';

import { UNKNOWN } from './constants';

export const getUmsUserName = (user: UMSUser, currentUserId = ''): string => {
  const userName = user.displayName || user.email || UNKNOWN;

  return user.id && user.id === currentUserId ? `${userName} (you)` : userName;
};
