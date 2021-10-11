import React from 'react';

import { UserAvatar } from 'components/user-avatar/UserAvatar';
import { useUserProfileQuery } from 'modules/api/user/useUserQuery';

interface Props {
  size?: number;
}
export const CurrentUserAvatar: React.FC<Props> = ({ size }) => {
  const { data: user } = useUserProfileQuery();

  return (
    <UserAvatar
      firstName={user?.firstname}
      lastName={user?.lastname}
      email={user?.email}
      size={size}
    />
  );
};
