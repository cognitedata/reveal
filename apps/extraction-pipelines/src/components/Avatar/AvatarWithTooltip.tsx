import React, { FunctionComponent } from 'react';
import { Avatar } from '@cognite/cogs.js';
import { StyledTooltip } from 'styles/StyledToolTip';
import { User } from 'model/User';

interface OwnProps {
  user: User;
}

type Props = OwnProps;

const AvatarWithTooltip: FunctionComponent<Props> = ({ user }: OwnProps) => {
  const display = user.name ?? user.email;
  const toolTip = user.email ?? user.name;

  return (
    <StyledTooltip placement="top" content={toolTip}>
      <Avatar text={display} aria-label={`Avatar for ${display}`} />
    </StyledTooltip>
  );
};

export default AvatarWithTooltip;
