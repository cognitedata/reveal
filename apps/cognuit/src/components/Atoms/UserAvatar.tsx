import * as React from 'react';
import { AuthConsumer } from '@cognite/react-container';
import { Avatar, Tooltip } from '@cognite/cogs.js';

export const UserAvatar: React.FC = () => {
  return (
    <AuthConsumer>
      {({ authState }) => {
        const user = authState?.email || '';

        return (
          <Tooltip content={`Logged in: ${String(user)}`}>
            <Avatar text={String(user)} />
          </Tooltip>
        );
      }}
    </AuthConsumer>
  );
};
