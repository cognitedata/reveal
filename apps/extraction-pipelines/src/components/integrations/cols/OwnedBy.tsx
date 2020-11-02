import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Avatar, Tooltip } from '@cognite/cogs.js';
import { User } from '../../../model/User';

const OwnedByAvatar = styled((props) => <Avatar {...props} />)`
  margin-right: 0.5rem;
`;
const Wrapper = styled.div`
  span {
    display: flex;
    align-items: center;
  }
`;

interface OwnProps {
  owner: User;
}

type Props = OwnProps;

const OwnedBy: FunctionComponent<Props> = ({ owner }: Props) => {
  const display = owner.name ? owner.name : owner.email;
  return (
    <Wrapper>
      <Tooltip placement="bottom" content={owner.email}>
        <>
          <OwnedByAvatar
            text={display}
            key={`avatar-${owner.email}`}
            aria-label={`Avatar for ${owner.name}`}
          />
          {display}
        </>
      </Tooltip>
    </Wrapper>
  );
};

export default OwnedBy;
