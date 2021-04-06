import React, { FunctionComponent, PropsWithChildren, useEffect } from 'react';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_INTEGRATION_CONTACTS } from 'utils/constants';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import ContactsList from 'components/ContactInformation/ContactsList';
import { Integration } from 'model/Integration';
import { AdditionalInfo } from 'components/integration/IntegrationView';
import { StyledTitle2 } from 'styles/StyledHeadings';
import { PageWrapperColumn } from 'styles/StyledPage';

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
    <PageWrapperColumn>
      <StyledTitle2>{TableHeadings.CONTACTS}</StyledTitle2>
      <AdditionalInfo>
        People listed as contacts for this integration
      </AdditionalInfo>
      <span className="info-field">
        <span className="info-label" />
        <ContactsList title={TableHeadings.CONTACTS} contacts={contacts} />
      </span>
    </PageWrapperColumn>
  );
};
