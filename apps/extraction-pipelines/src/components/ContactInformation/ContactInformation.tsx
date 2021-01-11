import React from 'react';
import ContactsList from './ContactsList';
import { User } from '../../model/User';
import { TableHeadings } from '../table/IntegrationTableCol';
import { DetailFieldNames } from '../../model/Integration';

interface ContactInformationProps {
  owner: User[];
  authors: User[];
}

const ContactInformation = ({ owner, authors }: ContactInformationProps) => {
  return (
    <div>
      <ContactsList title={DetailFieldNames.OWNER} contacts={owner} />
      <ContactsList title={TableHeadings.CONTACTS} contacts={authors} />
    </div>
  );
};

export default ContactInformation;
