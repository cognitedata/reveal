import React, { FunctionComponent } from 'react';
import { Avatar, Tooltip } from '@cognite/cogs.js';
import { User } from '../../../model/User';
import AvatarGroup from '../../Avatar/AvatarGroup';

interface OwnProps {
  users: User[];
}

type Props = OwnProps;

const UserGroup: FunctionComponent<Props> = ({ users }: Props) => {
  return (
    <AvatarGroup>
      {users.map((user) => {
        const display = user.name ? user.name : user.email;
        return (
          <Tooltip
            placement="bottom"
            content={user.email}
            key={`tooltip-${display}`}
          >
            <>
              <Avatar
                text={display}
                key={`avatar-${user.email}`}
                aria-label={`Avatar for ${user.name}`}
              />
            </>
          </Tooltip>
        );
      })}
    </AvatarGroup>
  );
};

export default UserGroup;
