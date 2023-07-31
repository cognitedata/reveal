import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

import * as React from 'react';

import { UserAvatar } from 'components/UserAvatar/UserAvatar';

interface Props {
  size?: number;
}
export const CurrentUserAvatar: React.FC<Props> = ({ size }) => {
  const { data: user } = useUserInfoQuery();

  return (
    <UserAvatar
      displayName={user?.displayName}
      email={user?.email}
      size={size}
    />
  );
};
