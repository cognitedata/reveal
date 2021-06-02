import React from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import EmailLink from 'components/buttons/EmailLink';
import { DivFlex } from 'styles/flex/StyledFlex';
import { User } from 'model/User';
import AvatarWithTooltip from 'components/Avatar/AvatarWithTooltip';
import { NotificationIcon } from 'components/icons/NotificationIcon';

const StyledContactCard = styled.section`
  display: flex;
  align-items: center;
  margin-left: 1rem;
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
  font-size: 0.875rem;
  margin: 0;
`;
const Role = styled.div`
  margin-left: 1rem;
  color: ${Colors['greyscale-grey8'].hex()};
`;
const VisuallyHidden = styled.span`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: static;
  white-space: nowrap;
  width: 1px;
`;
export const ContactCard = (user: User) => {
  const { name, email, role, sendNotification } = user;
  return (
    <StyledContactCard>
      <AvatarWithTooltip user={user} />
      <InfoList>
        <DivFlex>
          <Name>{name}</Name>
          <Role>{role}</Role>
        </DivFlex>
        <EmailLink email={email} />
      </InfoList>
      {sendNotification ? (
        <NotificationIcon title="Notification is turned on" />
      ) : (
        <VisuallyHidden>Notification is turned off</VisuallyHidden>
      )}
    </StyledContactCard>
  );
};
