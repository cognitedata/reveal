import React from 'react';
import { Title, Colors, Avatar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { User } from '../../model/User';

interface ContactsListProps {
  title: string;
  contacts: User[];
}

const StyledContactsList = styled.div`
  border-bottom: 1px solid #e8e8e8;
`;

const StyledContactCard = styled.div`
  display: flex;
  margin-bottom: 1.9375rem;
  .cogs-avatar {
    font-size: 1.375rem;
    font-weight: normal;
  }
`;

const H3 = styled((props) => <Title {...props}>{props.children}</Title>)`
  color: ${Colors['greyscale-grey9'].hex()};
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 0.9375rem;
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

const avatarSize = 50;

const ContactCard = ({ name, email }: User) => {
  const mailtoLink = `mailto:${email}`;
  return (
    <StyledContactCard>
      <InfoList>
        <Name>{name}</Name>
        <Email href={mailtoLink}>{email}</Email>
      </InfoList>
      <Avatar
        text={name}
        key={`avatar-${email}`}
        aria-label={`Avatar for ${name}`}
        size={avatarSize}
      />
    </StyledContactCard>
  );
};

const ContactsList = ({ title, contacts }: ContactsListProps) => {
  return (
    <StyledContactsList>
      <H3 level={3}>{title}</H3>
      {contacts.map(({ name, email }) => (
        <ContactCard key={email} name={name} email={email} />
      ))}
    </StyledContactsList>
  );
};

export default ContactsList;
