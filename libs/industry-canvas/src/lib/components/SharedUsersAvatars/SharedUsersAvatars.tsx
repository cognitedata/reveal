import React from 'react';

import { Avatar, AvatarGroup, SizeToken } from '@cognite/cogs.js';

import { UserProfile } from '../../UserProfileProvider';

type SharedUsersAvatarsProps = {
  users: UserProfile[];
  size?: Extract<SizeToken, 'medium' | 'small'>;
};

const SharedUsersAvatars: React.FC<SharedUsersAvatarsProps> = ({
  users,
  size = 'medium',
}) => {
  return (
    <AvatarGroup prominence="muted" overflow={4} size={size}>
      {users.map((user) => (
        <Avatar
          style={{ pointerEvents: 'none' }}
          key={user.userIdentifier}
          size={size}
          text={user.displayName}
        />
      ))}
    </AvatarGroup>
  );
};

export default SharedUsersAvatars;
