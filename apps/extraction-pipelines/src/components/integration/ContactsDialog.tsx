import React, { FunctionComponent, useState } from 'react';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import styled from 'styled-components';
import {
  CONTACTS_HINT,
  EMAIL_LABEL,
  NAME_LABEL,
  NOTIFICATION_LABEL,
  ROLE_LABEL,
} from 'utils/constants';
import { Hint } from 'styles/StyledForm';
import { User } from 'model/User';
import { Grid } from 'styles/grid/StyledGrid';
import { StyledTableNoRowColor2 } from 'styles/StyledTable';
import { Button, Input, Switch } from '@cognite/cogs.js';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { ErrorMessage } from 'components/error/ErrorMessage';

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
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [showErrors, setShowErrors] = useState(false);
  const onConfirm = async (updatedContacts: User[]) => {
    if (!current || !project) return;
    const items = createUpdateSpec({
      project,
      id: current.id,
      fieldValue: updatedContacts,
      fieldName: 'contacts',
    });
    await mutate(items, {
      onError: () => {
        setShowErrors(true);
      },
      onSuccess: () => {
        close();
      },
    });
  };

  return (
    <ContactsSectionWrapper role="grid">
      <Hint>{CONTACTS_HINT}</Hint>
      {current && (
        <ContactsDialogView
          initialContacts={current.contacts || []}
          onCancel={close}
          onConfirm={onConfirm}
          showErrors={showErrors}
        />
      )}
    </ContactsSectionWrapper>
  );
};

const isValidEmail = (email: string) => {
  // @Email(regexp = "^[\\w-\\+]+(\\.[\\w]+)*@[\\w-]+(\\.[\\w]+)*(\\.[a-zA-Z]{2,})$")
  //     @Size(min = 1, max = 254)
  return /^[\w-+]+(\.[\w]+)*@[\w-]+(\.[\w]+)*(\.[a-zA-Z]{2,})$/.test(email);
};

type ViewProps = {
  initialContacts: User[];
  onCancel: () => void;
  onConfirm: (updatedContacts: User[]) => void;
  showErrors: boolean;
};
export const ContactsDialogView = ({
  initialContacts,
  onCancel,
  onConfirm,
  showErrors,
}: ViewProps) => {
  const [contacts, setContacts] = useState(
    [...initialContacts].sort(
      (a, b) =>
        (isOwnerRole(a.role ?? '') ? -1000 : 0) -
        (isOwnerRole(b.role ?? '') ? -1000 : 0)
    )
  );
  const onEdit = (
    index: number,
    field: 'role' | 'name' | 'email' | 'sendNotification',
    newValue: any
  ) => {
    setContacts(
      contacts.map((contact, i) =>
        index === i
          ? {
              ...contact,
              [field]: newValue,
            }
          : contact
      )
    );
  };
  const deleteRow = (index: number) => {
    setContacts(contacts.filter((m, i) => i !== index));
  };
  const addRow = () => {
    setContacts([
      ...contacts,
      {
        name: '',
        email: '',
        role: contacts.length === 0 ? 'Owner' : '',
        sendNotification: false,
      },
    ]);
  };
  return (
    <>
      <StyledTableNoRowColor2>
        <table className="cogs-table">
          <thead>
            <tr>
              <td>{ROLE_LABEL}</td>
              <td>{NAME_LABEL}</td>
              <td>{EMAIL_LABEL}</td>
              <td>{NOTIFICATION_LABEL}</td>
              <td />
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => {
              return (
                <tr className="row-style-even row-height-4">
                  <td>
                    <Input
                      fullWidth
                      placeholder="E.g. Data engineer"
                      disabled={index === 0 && contact.role === 'Owner'}
                      value={contact.role}
                      onChange={(ev) => onEdit(index, 'role', ev.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      fullWidth
                      placeholder="Firstname Lastname"
                      value={contact.name}
                      onChange={(ev) => onEdit(index, 'name', ev.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      fullWidth
                      placeholder="name@example.com"
                      value={contact.email}
                      onChange={(ev) => onEdit(index, 'email', ev.target.value)}
                    />

                    {showErrors && !isValidEmail(contact.email) && (
                      <div css="font-size: 0.8rem">
                        <ErrorMessage>
                          Enter a valid email: name@example.com
                        </ErrorMessage>
                      </div>
                    )}
                  </td>
                  <td>
                    <Switch
                      name={`notification-switch-${index}`}
                      value={contact.sendNotification}
                      onChange={(newValue) =>
                        onEdit(index, 'sendNotification', newValue)
                      }
                    />
                  </td>
                  <td>
                    <Button
                      type="ghost"
                      icon="Close"
                      aria-label="Remove contact"
                      onClick={() => deleteRow(index)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </StyledTableNoRowColor2>

      <div>
        <Button icon="PlusCompact" onClick={addRow}>
          Add contact
        </Button>
      </div>

      <div css="display: flex; justify-content: flex-end; gap: 0.5rem">
        <Button onClick={onCancel} type="ghost">
          Cancel
        </Button>
        <Button onClick={() => onConfirm(contacts)} type="primary">
          Confirm
        </Button>
      </div>
    </>
  );
};
