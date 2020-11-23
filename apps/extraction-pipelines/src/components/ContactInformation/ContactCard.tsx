import React from 'react';
import { Colors, Avatar, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { User } from '../../model/User';

const StyledContactCard = styled.div`
  display: flex;
  margin-bottom: 1.9375rem;
`;

const InfoList = styled.div`
  width: 18.75rem;
`;

const Name = styled.p`
  color: ${Colors['greyscale-grey9'].hex()};
  font-size: 0.875rem;
  margin: 0;
`;
const Email = styled.a`
  color: ${Colors['midblue-3'].hex()};
  margin: 0;
`;
const ContactCard = ({ name, email }: User) => {
  const mailtoLink = `mailto:${email}`;
  return (
    <StyledContactCard>
      <InfoList>
        <Name>{name}</Name>
        <Email href={mailtoLink}>{email}</Email>
      </InfoList>
      <Tooltip placement="bottom" content={email}>
        <Avatar text={name} />
      </Tooltip>
    </StyledContactCard>
  );
};

export default ContactCard;
