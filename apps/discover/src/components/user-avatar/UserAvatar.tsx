import * as React from 'react';

import { Avatar } from '@cognite/cogs.js';

interface Props {
  displayName?: string;
  email?: string;
  size?: number;
}
export const UserAvatar: React.FC<Props> = ({ displayName, email, size }) => {
  return (
    <Avatar
      text={getAvatarString(displayName, email)}
      size={size}
      id="user-avatar"
      data-testid="user-avatar"
      aria-label="Open user profile"
    />
  );
};

export const getAvatarString = (displayName?: string, email?: string) => {
  if (displayName) {
    return displayName;
  }
  if (email) {
    return email;
  }

  return '?';
};
