import { UMSUser } from '@cognite/user-management-service-types';

import { UNASSIGNED } from 'pages/authorized/admin/feedback/constants';

import { getSplitUserName } from './getSplitUserName';
import { getUmsUserName } from './getUmsUserName';

export const getAssigneeName = (
  assignedUser?: UMSUser,
  currentUserId?: string
) => {
  if (!assignedUser) return UNASSIGNED;

  const splittedUserName = getSplitUserName(assignedUser?.displayName).name;

  return getUmsUserName(
    { ...assignedUser, displayName: splittedUserName },
    currentUserId
  );
};
