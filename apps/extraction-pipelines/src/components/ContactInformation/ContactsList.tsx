import React from 'react';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';

const StyledH3 = styled((props) => (
  <Title {...props}>{props.children}</Title>
))``;

const PersonName = styled.span``;
const PersonEmail = styled.span``;

const ContactCard = ({ name, email }: any) => {
  return (
    <>
      <PersonName>{name}</PersonName>
      <PersonEmail>{email}</PersonEmail>
    </>
  );
};

const ContactsList = ({ title, contacts }: any) => {
  return (
    <>
      <StyledH3 level={3}>{title}</StyledH3>
      {contacts.map(({ name, email }: any) => (
        <ContactCard name={name} email={email} />
      ))}
    </>
  );
};

export default ContactsList;
