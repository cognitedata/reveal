import * as React from 'react';

import { Avatar } from '@cognite/cogs.js';

interface Props {
  firstName?: string;
  lastName?: string;
  email?: string;
  size?: number;
}
export const UserAvatar: React.FC<Props> = ({
  firstName,
  lastName,
  email,
  size,
}) => {
  return (
    <Avatar
      text={getAvatarString(firstName, lastName, email)}
      size={size}
      id="user-avatar"
      data-testid="user-avatar"
      aria-label="Open user profile"
    />
  );
};

export const getAvatarString = (
  firstName?: string,
  lastName?: string,
  email?: string
) => {
  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`;
  }
  if (email) {
    return email;
  }

  return '?';
};
