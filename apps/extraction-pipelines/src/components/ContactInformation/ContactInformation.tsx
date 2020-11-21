import React from 'react';
import ContactsList from './ContactsList';
import { useSelectedIntegration } from '../../hooks/useSelectedIntegration';

const ContactInformation = () => {
  const { integration } = useSelectedIntegration();
  if (!integration) {
    return <></>;
  }
  const owner = [integration.owner];
  return (
    <div>
      <ContactsList title="Owner" contacts={owner} />
      <ContactsList title="Created by" contacts={integration.authors} />
    </div>
  );
};

export default ContactInformation;
