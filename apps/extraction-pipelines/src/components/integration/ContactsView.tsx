import React, { FunctionComponent, PropsWithChildren } from 'react';
import { TableHeadings } from '../table/IntegrationTableCol';
import ContactsList from '../ContactInformation/ContactsList';
import { Integration } from '../../model/Integration';
import { AdditionalInfo, DetailWrapper } from './IntegrationView';

interface ContactsViewProps {
  integration: Integration | null;
}

export const ContactsView: FunctionComponent<ContactsViewProps> = ({
  integration,
}: PropsWithChildren<ContactsViewProps>) => {
  const contacts = integration ? integration.contacts : [];
  return (
    <DetailWrapper>
      <h2>{TableHeadings.CONTACTS}</h2>
      <AdditionalInfo>
        People listed as contacts for this integration
      </AdditionalInfo>
      <span className="info-field">
        <span className="info-label" />
        <ContactsList title={TableHeadings.CONTACTS} contacts={contacts} />
      </span>
    </DetailWrapper>
  );
};
