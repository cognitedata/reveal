import React, { FunctionComponent, PropsWithChildren, useEffect } from 'react';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_INTEGRATION_CONTACTS } from 'utils/constants';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import ContactsList from 'components/ContactInformation/ContactsList';
import { Integration } from 'model/Integration';
import {
  AdditionalInfo,
  DetailWrapper,
} from 'components/integration/IntegrationView';

interface ContactsViewProps {
  integration: Integration | null;
}

export const ContactsView: FunctionComponent<ContactsViewProps> = ({
  integration,
}: PropsWithChildren<ContactsViewProps>) => {
  const contacts = integration ? integration.contacts : [];
  const integrationId = integration?.id;

  useEffect(() => {
    trackUsage(SINGLE_INTEGRATION_CONTACTS, { id: integrationId });
  }, [integrationId]);

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
