import { useMemo } from 'react';

import { splitUserName } from 'dataLayers/userManagementService/adapters/splitUserName';
import { getUmsUserName } from 'dataLayers/userManagementService/selectors/getUmsUserName';

import { UMSUser } from '@cognite/user-management-service-types';

import { SubTitle } from '../elements';

export const UserNameSubtitle: React.FC<{
  user: UMSUser;
  currentUserId?: string;
}> = ({ user, currentUserId }) => {
  const splittedUser = useMemo(
    () => splitUserName(user?.displayName),
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
