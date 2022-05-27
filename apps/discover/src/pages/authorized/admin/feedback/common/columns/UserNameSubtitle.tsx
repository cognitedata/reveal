import { getSplitUserName } from 'domain/userManagementService/internal/selectors/getSplitUserName';
import { getUmsUserName } from 'domain/userManagementService/internal/selectors/getUmsUserName';

import { useMemo } from 'react';

import { UMSUser } from '@cognite/user-management-service-types';

import { SubTitle } from '../elements';

export const UserNameSubtitle: React.FC<{
  user: UMSUser;
  currentUserId?: string;
}> = ({ user, currentUserId }) => {
  const splittedUser = useMemo(
    () => getSplitUserName(user?.displayName),
    [user.displayName]
  );

  const userName = getUmsUserName(
    { ...user, displayName: splittedUser.name },
    currentUserId
  );

  return (
    <div>
      {userName}
      {splittedUser.subTitle && <SubTitle>{splittedUser.subTitle}</SubTitle>}
    </div>
  );
};
