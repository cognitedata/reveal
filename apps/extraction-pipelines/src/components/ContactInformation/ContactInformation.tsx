import React from 'react';
import ContactsList from './ContactsList';

const ContactInformation = ({ owner, authors }: any) => {
  return (
    <div>
      <ContactsList title="Owner" contacts={owner} />
      <ContactsList title="Created by" contacts={authors} />
    </div>
  );
};

export default ContactInformation;
