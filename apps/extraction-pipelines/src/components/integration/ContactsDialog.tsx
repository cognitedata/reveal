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
import { Hint } from 'styles/StyledForm';
import { NotificationUpdateSwitch } from 'components/inputs/NotificationUpdateSwitch';
import { Integration } from 'model/Integration';
import { User } from 'model/User';
import { Grid } from 'styles/grid/StyledGrid';
import { StyledTableNoRowColor2 } from 'styles/StyledTable';
import { ErrorMessage } from 'components/error/ErrorMessage';
import { Button } from '@cognite/cogs.js';
import { AddContact } from './AddContact';

export const ContactsSectionWrapper = styled(Grid)`
  align-content: flex-start;
  gap: 1rem;
`;
export const OwnerWrapper = styled.div`
  margin-bottom: 2rem;
`;
export const Row = styled.div`
  display: grid;
  grid-template-columns: 2rem 10rem 6rem 2fr 2fr 5rem;
  grid-column-gap: 0.5rem;
  align-items: center;
  input {
    width: 100%;
  }
`;

export const Heading = styled.span`
  padding: 0.5rem 0.75rem 0.5rem 1rem;
`;
interface ContactsSectionProps {
  close: () => void;
}

export const isOwnerRole = (role: string) => role.toLowerCase() === 'owner';
export const ContactsDialog: FunctionComponent<ContactsSectionProps> = ({
  close,
}) => {
  const { integration } = useSelectedIntegration();
  const { data: current } = useIntegrationById(integration?.id);
  const contacts =
    (current?.contacts || []).map((u, index) => ({ ...u, index })) ?? [];
  const numOwners = contacts.reduce(
    (count, contact) => count + (isOwnerRole(contact.role ?? '') ? 1 : 0),
    0
  );

  return (
    <ContactsSectionWrapper role="grid">
      <Hint>{CONTACTS_HINT}</Hint>
      {integration && contactTable(contacts, integration)}

      <AddContact isOwner={numOwners === 0} />

      {numOwners >= 2 && <ErrorMessage>Too many owners.</ErrorMessage>}

      <div css="display: flex; justify-content: flex-end">
        <Button onClick={close} type="primary">
          Close
        </Button>
      </div>
    </ContactsSectionWrapper>
  );
};

function contactTable(
  contacts: (User & { index: number })[],
  integration: Integration
) {
  const contactsSorted = [...contacts].sort(
    (a, b) =>
      (isOwnerRole(a.role ?? '') ? -1000 : a.index) -
      (isOwnerRole(b.role ?? '') ? -1000 : b.index)
  );
  return (
    <StyledTableNoRowColor2>
      <table className="cogs-table">
        <thead>
          <tr>
            <td>{ROLE_LABEL}</td>
            <td>{NOTIFICATION_LABEL}</td>
            <td>{NAME_LABEL}</td>
            <td>{EMAIL_LABEL}</td>
            <td />
          </tr>
        </thead>
        <tbody>
          {contactsSorted.map((contact) => {
            return (
              <tr key={contact.email} className="row-style-even row-height-4">
                <td>
                  <EditPartContacts
                    integration={integration}
                    name="contacts"
                    index={contact.index}
                    field="role"
                    label="Role"
                    schema={contactRoleSchema}
                    defaultValues={{ role: contact.role }}
                  />
                </td>
                <td>
                  <NotificationUpdateSwitch
                    integration={integration}
                    name="contacts"
                    index={contact.index}
                    field="sendNotification"
                    defaultValues={{
                      sendNotification: contact.sendNotification,
                    }}
                  />
                </td>
                <td>
                  <EditPartContacts
                    integration={integration}
                    name="contacts"
                    index={contact.index}
                    field="name"
                    label={TableHeadings.NAME}
                    schema={contactNameSchema}
                    defaultValues={{ name: contact.name }}
                  />
                </td>
                <td>
                  <EditPartContacts
                    integration={integration}
                    name="contacts"
                    index={contact.index}
                    field="email"
                    label="Email"
                    schema={contactEmailSchema}
                    defaultValues={{ email: contact.email }}
                  />
                </td>

                <td>
                  <RemoveContactButton
                    integration={integration}
                    name="contacts"
                    index={contact.index}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </StyledTableNoRowColor2>
  );
}
