import React from 'react';
import ContactsList from './ContactsList';
import { User } from '../../model/User';
import { TableHeadings } from '../table/IntegrationTableCol';

interface ContactInformationProps {
  owner: User[];
  authors: User[];
}

const ContactInformation = ({ owner, authors }: ContactInformationProps) => {
  return (
    <div>
      <ContactsList title={TableHeadings.OWNER} contacts={owner} />
      <ContactsList title={TableHeadings.CREATED_BY} contacts={authors} />
    </div>
  );
};

export default ContactInformation;
