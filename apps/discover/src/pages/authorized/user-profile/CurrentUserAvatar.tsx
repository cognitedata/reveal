import React from 'react';

import { useUserInfo } from 'services/userManagementService/query';

import { UserAvatar } from 'components/UserAvatar/UserAvatar';

interface Props {
  size?: number;
}
export const CurrentUserAvatar: React.FC<Props> = ({ size }) => {
  const { data: user } = useUserInfo();

  return (
    <UserAvatar
      displayName={user?.displayName}
      email={user?.email}
      size={size}
    />
  );
};
