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
import { Hint } from 'styles/StyledForm';
import { NotificationUpdateSwitch } from 'components/inputs/NotificationUpdateSwitch';
import { Integration } from 'model/Integration';
import { User } from 'model/User';
import { Grid } from 'styles/grid/StyledGrid';
import { bottomSpacing } from 'styles/StyledVariables';
import { AddContact } from './AddContact';
import { StyledTableNoRowColor2 } from 'styles/StyledTable';
import { ErrorMessage } from 'components/error/ErrorMessage';

export const ContactsSectionWrapper = styled(Grid)`
  align-content: flex-start;
  margin-bottom: ${bottomSpacing};
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
const HeadingRow = styled(Row)``;

export const Heading = styled.span`
  padding: 0.5rem 0.75rem 0.5rem 1rem;
`;
interface ContactsSectionProps {}

const isOwnerRole = (role: string) => role.toLowerCase() === 'owner';
export const ContactsSection: FunctionComponent<ContactsSectionProps> = () => {
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
      <StyledTitle2 id="contacts-heading">
        {TableHeadings.CONTACTS}
      </StyledTitle2>
      <Hint>{CONTACTS_HINT}</Hint>
      {integration && contactTable(contacts, integration)}

      <AddContact isOwner={numOwners === 0} />

      {numOwners >= 2 && <ErrorMessage>Too many owners.</ErrorMessage>}
    </ContactsSectionWrapper>
  );
};

function contactTable(
  contacts: (User & { index: number })[],
  integration: Integration
) {
  const contactsSorted = [...contacts].sort(
    (a, b) =>
      (isOwnerRole(a.role ?? '') ? -100 : a.index) -
      (isOwnerRole(b.role ?? '') ? -100 : b.index)
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
