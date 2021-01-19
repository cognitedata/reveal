import React from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import EmailLink from 'components/buttons/EmailLink';
import { User } from '../../model/User';
import AvatarWithTooltip from '../Avatar/AvatarWithTooltip';
import { capitalizeWords } from '../../utils/primitivesUtils';

const StyledContactCard = styled.section`
  display: flex;
  margin-bottom: 1.9375rem;
  span {
    display: flex;
    align-items: center;
  }
`;

const InfoList = styled.div`
  margin-left: 0.875rem;
  width: 18.75rem;
`;

const Name = styled.h4`
  color: ${Colors['greyscale-grey9'].hex()};
  font-size: 0.875rem;
  margin: 0;
`;
const Role = styled.div``;

export const ContactCard = (user: User) => {
  const { name, email, role } = user;
  return (
    <StyledContactCard>
      <AvatarWithTooltip user={user} />
      <InfoList>
        <Name>{name}</Name>
        <Role>{role && capitalizeWords(role)}</Role>
        <EmailLink email={email} />
      </InfoList>
    </StyledContactCard>
  );
};
