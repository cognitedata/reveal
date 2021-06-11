import React, { FunctionComponent } from 'react';
import { Avatar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { StyledTooltip } from 'styles/StyledToolTip';
import { User } from 'model/User';
import AvatarGroup from 'components/Avatar/AvatarGroup';
import AvatarWithTooltip from 'components/Avatar/AvatarWithTooltip';

export const StyledBlueAvatarTooltip = styled.div`
  p {
    margin: 0 0 0.3125rem;
  }
`;

interface OwnProps {
  integrationId: number;
  users: User[];
}

type Props = OwnProps;

const blueAvatarTooltip = (
  users: User[],
  integrationId: number,
  avatarsLimit: number
) => {
  const hiddenAvatars = users.slice(avatarsLimit);
  return (
    <StyledBlueAvatarTooltip>
      {hiddenAvatars.map((value) => {
        return (
          <p
            key={`blue-avatar-${integrationId}-${value.email}-${value.name}-${value.role}`}
          >
            {value.email}
          </p>
        );
      })}
    </StyledBlueAvatarTooltip>
  );
};

const UserGroup: FunctionComponent<Props> = ({
  users = [],
  integrationId,
}: Props) => {
  const avatarsLimit = 2;
  const showBlueAvatar = users.length > avatarsLimit;
  return (
    <AvatarGroup>
      {users
        .filter((_, index) => avatarsLimit > index)
        .map((user) => {
          return (
            <AvatarWithTooltip
              key={`avatar-${integrationId}-${user.email}-${user.name}-${user.role}`}
              user={user}
            />
          );
        })}
      {showBlueAvatar ? (
        <StyledTooltip
          placement="top"
          content={blueAvatarTooltip(users, integrationId, avatarsLimit)}
          key={`tooltip-avatar-${integrationId}`}
        >
          <Avatar
            text={`+ ${users.length - avatarsLimit}`}
            key="avatar-blue-avatar"
            className="bg-blue"
          />
        </StyledTooltip>
      ) : (
        <></>
      )}
    </AvatarGroup>
  );
};

export default UserGroup;
