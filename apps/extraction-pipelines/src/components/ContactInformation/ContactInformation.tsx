import React from 'react';
import ContactsList from './ContactsList';

const mockData = {
  owner: [{ name: 'Peter Burg', email: 'peter.burg@cognite.com' }],
  createdBy: [
    { name: 'Anna Smith', email: 'anna.smith@cognite.com' },
    { name: 'Brian Jones', email: 'brian.jones@cognite.com' },
    { name: 'Bjorn Hansen', email: 'bjorn.hansen@cognite.com' },
  ],
};

const ContactInformation = () => {
  return (
    <div>
      <ContactsList title="Owner" contacts={mockData.owner} />
      <ContactsList title="Created by" contacts={mockData.createdBy} />
    </div>
  );
};

export default ContactInformation;
