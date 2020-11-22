import React from 'react';
import ContactsList from './ContactsList';
import { User } from '../../model/User';

interface ContactInformationProps {
  owner: User[];
  authors: User[];
}

const ContactInformation = ({ owner, authors }: ContactInformationProps) => {
  return (
    <div>
      <ContactsList title="Owner" contacts={owner} />
      <ContactsList title="Created by" contacts={authors} />
    </div>
  );
};

export default ContactInformation;
