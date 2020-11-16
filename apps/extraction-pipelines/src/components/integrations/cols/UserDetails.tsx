import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Avatar, Tooltip } from '@cognite/cogs.js';
import { User } from '../../../model/User';

const UserDetailsAvatar = styled((props) => <Avatar {...props} />)`
  margin-right: 0.5rem;
`;
const Wrapper = styled.div`
  span {
    display: flex;
    align-items: center;
  }
`;

interface OwnProps {
  user: User;
}

type Props = OwnProps;

const UserDetails: FunctionComponent<Props> = ({ user }: Props) => {
  const display = user.name ? user.name : user.email;
  return (
    <Wrapper>
      <Tooltip placement="bottom" content={user.email}>
        <>
          <UserDetailsAvatar
            text={display}
            key={`avatar-${user.email}`}
            aria-label={`Avatar for ${user.name}`}
          />
          {display}
        </>
      </Tooltip>
    </Wrapper>
  );
};

export default UserDetails;
