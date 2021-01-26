import React from 'react';
import styled from 'styled-components';
import { Colors, Title } from '@cognite/cogs.js';
import ContactsList from './ContactsList';
import { User } from '../../model/User';
import { TableHeadings } from '../table/IntegrationTableCol';

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

interface ContactInformationProps {
  contacts: User[];
}

const ContactInformation = ({ contacts }: ContactInformationProps) => {
  return (
    <StyledContactsList>
      <H3 level={3}>{TableHeadings.CONTACTS}</H3>
      <ContactsList title={TableHeadings.CONTACTS} contacts={contacts} />
    </StyledContactsList>
  );
};

export default ContactInformation;
