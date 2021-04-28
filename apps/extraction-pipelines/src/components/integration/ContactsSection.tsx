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
  OWNER_HINT,
  ROLE_LABEL,
} from 'utils/constants';
import { StyledTitle2 } from 'styles/StyledHeadings';
import { Hint } from 'styles/StyledForm';
import { NotificationUpdateSwitch } from 'components/inputs/NotificationUpdateSwitch';
import { DetailFieldNames } from 'model/Integration';
import { isOwner, partition } from 'utils/integrationUtils';
import { User } from 'model/User';
import { Grid } from 'styles/grid/StyledGrid';
import { bottomSpacing } from 'styles/StyledVariables';
import { AddContact } from './AddContact';

export const ContactsSectionWrapper = styled(Grid)`
  align-content: flex-start;
  margin-bottom: ${bottomSpacing};
`;
export const OwnerWrapper = styled.div`
  margin-bottom: 2rem;
`;
export const Row = styled.div`
  display: grid;
  grid-template-columns: 10rem 6rem 2fr 2fr 5rem;
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
  const { pass: owner } = partition(current?.contacts ?? [], isOwner);

  const renderOwner = (innerOwner: ReadonlyArray<User>) => {
    if (innerOwner[0]) {
      return (
        <>
          <HeadingRow>
            <Heading>{ROLE_LABEL}</Heading>
            <Heading>{NOTIFICATION_LABEL}</Heading>
            <Heading>{NAME_LABEL}</Heading>
            <Heading>{EMAIL_LABEL}</Heading>
          </HeadingRow>
          {current?.contacts?.map((contact, index) => {
            const key = `owner-${index}`;
            if (!isOwner(contact)) {
              return null;
            }
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
                  defaultValues={{
                    sendNotification: contact?.sendNotification,
                  }}
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
        </>
      );
    }
    return <AddContact isOwner />;
  };

  return (
    <ContactsSectionWrapper role="grid">
      <StyledTitle2 id="owner-heading">{DetailFieldNames.OWNER}</StyledTitle2>
      <Hint>{OWNER_HINT}</Hint>
      <OwnerWrapper>{renderOwner(owner)}</OwnerWrapper>

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
        if (isOwner(contact)) {
          return null;
        }
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
