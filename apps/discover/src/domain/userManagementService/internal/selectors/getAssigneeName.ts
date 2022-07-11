import { UMSUser } from '@cognite/user-management-service-types';

import { getSplitUserName } from './getSplitUserName';
import { getUmsUserName } from './getUmsUserName';

export const getAssigneeName = (
  assignedUser?: UMSUser,
  currentUserId?: string
) => {
  if (!assignedUser) return undefined;

  const splittedUserName = getSplitUserName(assignedUser?.displayName).name;

  return getUmsUserName(
    { ...assignedUser, displayName: splittedUserName },
    currentUserId
  );
};
