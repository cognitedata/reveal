import React, { FunctionComponent, useState, ChangeEvent } from 'react';
import { getProject, isValidEmail } from '@cognite/cdf-utilities';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import styled from 'styled-components';
import { StyledTableNoRowColor2, Grid, Hint } from 'components/styled';
import { User } from 'model/User';
import { Button, Input, Switch } from '@cognite/cogs.js';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { ErrorMessage } from 'components/error/ErrorMessage';
import { InfoBox } from 'components/message/InfoBox';
import { useTranslation } from 'common';
interface ContactsSectionProps {
  close: () => void;
}

export const isOwnerRole = (role: string) => role.toLowerCase() === 'owner';

export const ContactsDialog: FunctionComponent<ContactsSectionProps> = ({
  close,
}) => {
  const { t } = useTranslation();
  const { extpipe } = useSelectedExtpipe();
  const { data: current } = useExtpipeById(extpipe?.id);
  const project = getProject();
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
      <Hint>{t('contact-hint')}</Hint>
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
  const { t } = useTranslation();
  const emptyContact = {
    name: '',
    email: '',
    role: '',
    sendNotification: false,
  };

  const [contacts, setContacts] = useState(
    initialContacts.length === 0
      ? [{ ...emptyContact, role: 'Owner' }]
      : [...initialContacts].sort(
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
  const numOwners = contacts.reduce(
    (acc, c) => (isOwnerRole(c.role || '') ? acc + 1 : acc),
    0
  );
  const addRow = () => {
    setContacts(
      numOwners === 0
        ? [{ ...emptyContact, role: 'Owner' }, ...contacts]
        : [...contacts, emptyContact]
    );
  };
  return (
    <>
      <StyledTableNoRowColor2>
        <table className="cogs-table">
          <thead>
            <tr>
              <td>{t('role')}</td>
              <td>{t('name')}</td>
              <td>{t('email')}</td>
              <td>{t('notification_one', { count: 1 })}</td>
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
                      placeholder={t('role-placeholder')}
                      disabled={index === 0 && contact.role === 'Owner'}
                      value={contact.role}
                      onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                        onEdit(index, 'role', ev.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      fullWidth
                      placeholder={t('name-placeholder')}
                      value={contact.name}
                      onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                        onEdit(index, 'name', ev.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      fullWidth
                      placeholder={t('email-placeholder')}
                      value={contact.email}
                      onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                        onEdit(index, 'email', ev.target.value)
                      }
                    />

                    {showErrors && !isValidEmail(contact.email) && (
                      <div style={{ fontSize: '0.8rem' }}>
                        <ErrorMessage>{t('email-err')}</ErrorMessage>
                      </div>
                    )}
                  </td>
                  <td>
                    <Switch
                      name={`notification-switch-${index}`}
                      value={contact.sendNotification}
                      onChange={(newValue: any) =>
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
        <Button icon="AddLarge" onClick={addRow}>
          {numOwners === 0 ? t('add-owner') : t('add-contact')}
        </Button>
      </div>

      {numOwners === 0 && (
        <InfoBox iconType="WarningFilled" color="warning">
          {t('owner-err')}
        </InfoBox>
      )}
      {numOwners >= 2 && (
        <InfoBox iconType="WarningFilled" color="warning">
          {t('one-owner-err')}
        </InfoBox>
      )}

      <div
        style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}
      >
        <Button onClick={onCancel} type="ghost">
          {t('cancel')}
        </Button>
        <Button
          onClick={() => onConfirm(contacts)}
          type="primary"
          data-testId="confirm"
        >
          {t('confirm')}
        </Button>
      </div>
    </>
  );
};

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
