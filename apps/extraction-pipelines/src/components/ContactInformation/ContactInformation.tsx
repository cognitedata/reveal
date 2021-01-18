import React from 'react';
import ContactsList from './ContactsList';
import { User } from '../../model/User';
import { TableHeadings } from '../table/IntegrationTableCol';

interface ContactInformationProps {
  contacts: User[];
}

const ContactInformation = ({ contacts }: ContactInformationProps) => {
  return (
    <div>
      <ContactsList title={TableHeadings.CONTACTS} contacts={contacts} />
    </div>
  );
};

export default ContactInformation;
