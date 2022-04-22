import { UMSUser } from '@cognite/user-management-service-types';

import { UNASSIGNED } from 'pages/authorized/admin/feedback/constants';

import { getUmsUserName } from '../selectors/getUmsUserName';

import { splitUserName } from './splitUserName';

export const getAssigneeName = (
  assignedUser?: UMSUser,
  currentUserId?: string
) => {
  if (!assignedUser) return UNASSIGNED;

  const splittedUserName = splitUserName(assignedUser?.displayName).name;

  return getUmsUserName(
    { ...assignedUser, displayName: splittedUserName },
    currentUserId
  );
};
