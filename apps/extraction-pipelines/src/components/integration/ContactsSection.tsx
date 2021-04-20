import React, { FunctionComponent } from 'react';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import {
  contactEmailSchema,
  contactNameSchema,
  contactRoleSchema,
} from 'utils/validation/integrationSchemas';
import { EditPartContacts } from 'components/integration/EditPartContacts';
import { RemoveContactButton } from 'components/integration/RemoveContactButton';
import styled from 'styled-components';
import {
  CONTACTS_HINT,
  EMAIL_LABEL,
  NAME_LABEL,
  NOTIFICATION_LABEL,
  ROLE_LABEL,
} from 'utils/constants';
import { StyledTitle2 } from 'styles/StyledHeadings';
import { DetailsGrid } from 'components/form/viewEditIntegration/MainDetails';
import { Hint } from 'styles/StyledForm';
import { NotificationUpdateSwitch } from 'components/inputs/NotificationUpdateSwitch';
import { AddContact } from './AddContact';

export const ContactsSectionWrapper = styled(DetailsGrid)`
  align-content: flex-start;
  padding: 1rem;
`;
export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 6rem 2fr 2fr 5rem;
  grid-column-gap: 0.5rem;
  align-items: center;
  input {
    width: 100%;
  }
`;
const HeadingRow = styled(Row)``;

export const Heading = styled.span`
  padding: 0.5rem 0.75rem 0.5rem 1rem;
`;
interface ContactsSectionProps {}

export const ContactsSection: FunctionComponent<ContactsSectionProps> = () => {
  const { integration } = useSelectedIntegration();
  const { data: current } = useIntegrationById(integration?.id);

  return (
    <ContactsSectionWrapper role="grid">
      <StyledTitle2 id="contacts-heading">
        {TableHeadings.CONTACTS}
      </StyledTitle2>
      <Hint>{CONTACTS_HINT}</Hint>
      <HeadingRow>
        <Heading>{ROLE_LABEL}</Heading>
        <Heading>{NOTIFICATION_LABEL}</Heading>
        <Heading>{NAME_LABEL}</Heading>
        <Heading>{EMAIL_LABEL}</Heading>
      </HeadingRow>
      {current?.contacts?.map((contact, index) => {
        const key = `contacts-${index}`;
        return (
          <Row key={key} className="row-style-even row-height-4">
            <EditPartContacts
              integration={current}
              name="contacts"
              index={index}
              field="role"
              label="Role"
              schema={contactRoleSchema}
              defaultValues={{ role: contact?.role }}
            />
            <NotificationUpdateSwitch
              integration={current}
              name="contacts"
              index={index}
              field="sendNotification"
              defaultValues={{ sendNotification: contact?.sendNotification }}
            />
            <EditPartContacts
              integration={current}
              name="contacts"
              index={index}
              field="name"
              label={TableHeadings.NAME}
              schema={contactNameSchema}
              defaultValues={{ name: contact?.name }}
            />
            <EditPartContacts
              integration={current}
              name="contacts"
              index={index}
              field="email"
              label="Email"
              schema={contactEmailSchema}
              defaultValues={{ email: contact?.email }}
            />

            <RemoveContactButton
              integration={current}
              name="contacts"
              index={index}
            />
          </Row>
        );
      })}
      <AddContact />
    </ContactsSectionWrapper>
  );
};
