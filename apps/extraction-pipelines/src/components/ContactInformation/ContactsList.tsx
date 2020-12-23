import React from 'react';
import { Title, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import ContactCard from './ContactCard';
import { User } from '../../model/User';

interface ContactsListProps {
  title: string;
  contacts: User[];
}

const StyledContactsList = styled.div`
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;

const H3 = styled((props) => <Title {...props}>{props.children}</Title>)`
  color: ${Colors['greyscale-grey9'].hex()};
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 0.9375rem;
`;

const ContactsList = ({ title, contacts }: ContactsListProps) => {
  const renderList = (titleText: string, users?: User[]) => {
    if (!users || users.length === 0) {
      return <i>{`No ${titleText.toLowerCase()} set`}</i>;
    }
    return (
      <>
        {users.map(({ name, email }) => (
          <ContactCard
            key={`contact-list-${email}-${name}`}
            name={name}
            email={email}
          />
        ))}
      </>
    );
  };
  return (
    <StyledContactsList>
      <H3 level={3}>{title}</H3>
      {renderList(title, contacts)}
    </StyledContactsList>
  );
};

export default ContactsList;
