import React, { FunctionComponent } from 'react';
import { Avatar, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { User } from '../../../model/User';
import AvatarGroup from '../../Avatar/AvatarGroup';

export const StyledBlueAvatarTooltip = styled.div`
  p {
    margin: 0 0 0.3125rem;
  }
`;

interface OwnProps {
  users: User[];
}

type Props = OwnProps;

const blueAvatarTooltip = (users: User[], avatarsLimit: number) => {
  const hiddenAvatars = users.slice(avatarsLimit);
  return (
    <StyledBlueAvatarTooltip>
      {hiddenAvatars.map((value) => {
        return <p key={value.email}>{value.email}</p>;
      })}
    </StyledBlueAvatarTooltip>
  );
};

const UserGroup: FunctionComponent<Props> = ({ users }: Props) => {
  const avatarsLimit = 2;
  const showBlueAvatar = users.length > avatarsLimit;
  return (
    <AvatarGroup>
      {users
        .filter((_, index) => avatarsLimit > index)
        .map((user) => {
          const display = user.name ? user.name : user.email;
          return (
            <Tooltip
              placement="bottom"
              content={user.email}
              key={`tooltip-${display}`}
            >
              <Avatar
                text={display}
                key={`avatar-${user.email}`}
                aria-label={`Avatar for ${user.name}`}
              />
            </Tooltip>
          );
        })}
      {showBlueAvatar ? (
        <Tooltip
          placement="bottom"
          content={blueAvatarTooltip(users, avatarsLimit)}
          key="tooltip-blue-avatar"
        >
          <Avatar
            text={`+ ${users.length - avatarsLimit}`}
            key="avatar-blue-avatar"
            className="bg-blue"
          />
        </Tooltip>
      ) : (
        <></>
      )}
    </AvatarGroup>
  );
};

export default UserGroup;
