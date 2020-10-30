import React, { FunctionComponent } from 'react';
import { Avatar } from 'antd';
import styled from 'styled-components';
import { Tooltip } from '@cognite/cogs.js';
import { User } from '../../../model/User';

const OwnedByAvatar = styled((props) => (
  <Avatar {...props}>{props.children}</Avatar>
))`
  margin-right: 0.5rem;
`;

interface OwnProps {
  owner: User;
}

type Props = OwnProps;

const OwnedBy: FunctionComponent<Props> = ({ owner }: Props) => {
  const display = owner.name ? owner.name : owner.email;
  return (
    <>
      <Tooltip placement="bottom" content={owner.email}>
        <>
          <OwnedByAvatar
            key={`avatar-${owner.email}`}
            alt={`avatar for ${owner.name}`}
          >
            {display.substr(0, 1)}
          </OwnedByAvatar>
          {display}
        </>
      </Tooltip>
    </>
  );
};

export default OwnedBy;
