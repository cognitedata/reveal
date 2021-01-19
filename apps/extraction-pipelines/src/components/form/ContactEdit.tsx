import React, { FunctionComponent, useState } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ArrayField, useFormContext } from 'react-hook-form';
import { InputWithError } from '../inputs/InputWithError';
import {
  CONTACT_EMAIL_TEST_ID,
  CONTACT_NAME_TEST_ID,
  CONTACT_NOTIFICATION_TEST_ID,
  CONTACT_ROLE_TEST_ID,
  EMAIL_LABEL,
  EMAIL_NOTIFICATION_TOOLTIP,
  EMAIL_PLACEHOLDER,
  NAME_LABEL,
  NAME_PLACEHOLDER,
  ROLE_LABEL,
  ROLE_PLACEHOLDER,
} from '../../utils/constants';
import { SwitchWithRef } from '../inputs/SwitchRef';
import { InputWarningIcon } from '../icons/InputWarningIcon';
import { ContactBtnTestIds } from './ContactsView';
import ErrorMessageDialog from '../buttons/ErrorMessageDialog';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import { User } from '../../model/User';
import { createUpdateSpec } from '../../utils/contactsUtils';

const EditWrapper = styled.div`
  padding: 1rem 0.75rem;
  display: grid;
  grid-template-columns: 2fr 2fr 1.5rem 5rem 4rem;
  grid-template-rows: 4rem 4rem;
  grid-column-gap: 0.4rem;
  grid-row-gap: 1rem;
  grid-template-areas:
    'name email warning cancel save'
    'role notification warning cancel save ';
  #contact-name {
    grid-area: name;
  }
  #contact-email {
    grid-area: email;
  }
  #contact-role {
    grid-area: role;
  }
  #contact-notification {
    grid-area: notification;
    .cogs-switch {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1rem 0.5rem 1rem;
    }
  }
  #cancel-btn {
    grid-area: cancel;
    align-self: center;
  }
  span[aria-expanded] {
    grid-area: save;
    align-self: center;
  }
  .cogs-icon-Warning {
    grid-area: warning;
    align-self: center;
  }
`;

interface ContactEditProps {
  field: Partial<ArrayField<Record<string, any>, 'id'>>;
  index: number;
  setIsEdit: (isEdit: boolean) => void;
}

export const ContactEdit: FunctionComponent<ContactEditProps> = ({
  field,
  index,
  setIsEdit,
}: ContactEditProps) => {
  const {
    dispatch,
    state: { integration, updates },
  } = useIntegration();
  const { register, errors, trigger, getValues, setValue } = useFormContext();
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [errorVisible, setErrorVisible] = useState(false);
  const isDirty = updates.has(`contacts-${index}`);

  async function onSave() {
    const valid = await trigger();
    if (valid && integration && project) {
      const aut = getValues();
      const actual = aut.contacts[index];
      const contacts = integration?.contacts ?? [];
      const contactsToSave = contacts.map((contact: User, idx: number) => {
        if (idx === index) {
          return actual;
        }
        return contact;
      });
      const items = createUpdateSpec({
        id: integration.id,
        fieldValue: contactsToSave,
        fieldName: 'contacts',
      });

      await mutate(
        {
          project,
          items,
          id: integration.id,
        },
        {
          onError: () => {
            setErrorVisible(true);
          },
          onSuccess: () => {
            dispatch({
              type: 'UPDATE_CONTACT',
              payload: { index, contact: actual },
            });
            dispatch({
              type: 'REMOVE_CHANGE',
              payload: { index, name: 'contacts' },
            });
            setIsEdit(false);
          },
        }
      );
    }
  }

  function onCancel() {
    dispatch({
      type: 'REMOVE_CHANGE',
      payload: { index, name: 'contacts' },
    });
    setValue(
      `contacts[${index}].sendNotification`,
      integration?.contacts[index]?.sendNotification
    );
    setIsEdit(false);
  }

  const handleChange = (_: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'ADD_CHANGE',
      payload: { index, name: 'contacts' },
    });
  };

  const handleClickError = () => {
    setErrorVisible(false);
    dispatch({
      type: 'REMOVE_CHANGE',
      payload: { index, name: 'contacts' },
    });
    setIsEdit(false);
  };

  return (
    <EditWrapper key={field?.id} className="row-style-even row-height-4">
      <InputWithError
        wrapperId="contact-name"
        name={`contacts[${index}].name`}
        hasError={errors.contacts?.[index]?.name}
        errors={errors}
        defaultValue={integration?.contacts[index]?.name}
        register={register}
        handleChange={handleChange}
        placeholder={NAME_PLACEHOLDER}
        label={NAME_LABEL}
        data-testid={`${CONTACT_NAME_TEST_ID}${index}`}
      />

      <InputWithError
        wrapperId="contact-email"
        name={`contacts[${index}].email`}
        hasError={errors.contacts?.[index]?.email}
        errors={errors}
        defaultValue={integration?.contacts[index]?.email}
        register={register}
        handleChange={handleChange}
        placeholder={EMAIL_PLACEHOLDER}
        label={EMAIL_LABEL}
        data-testid={`${CONTACT_EMAIL_TEST_ID}${index}`}
      />
      <InputWithError
        wrapperId="contact-role"
        name={`contacts[${index}].role`}
        errors={errors}
        hasError={errors.contacts?.[index]?.role}
        defaultValue={integration?.contacts[index]?.role}
        register={register}
        handleChange={handleChange}
        placeholder={ROLE_PLACEHOLDER}
        label={ROLE_LABEL}
        data-testid={`${CONTACT_ROLE_TEST_ID}${index}`}
      />
      <div id="contact-notification">
        <SwitchWithRef
          label="Notification"
          name={`contacts[${index}].sendNotification`}
          handleChange={handleChange}
          defaultChecked={
            integration?.contacts[index]?.sendNotification ?? false
          }
          register={register}
          data-testid={`${CONTACT_NOTIFICATION_TEST_ID}${index}`}
          aria-label={EMAIL_NOTIFICATION_TOOLTIP}
        />
      </div>

      {isDirty ? (
        <InputWarningIcon
          $color={Colors.warning.hex()}
          data-testid={`warning-icon-contacts-${index}`}
          className="waring"
        />
      ) : (
        <span className="warning" />
      )}
      <Button
        id="cancel-btn"
        variant="default"
        className="edit-form-btn"
        onClick={onCancel}
        aria-controls="name email"
        data-testid={`${ContactBtnTestIds.CANCEL_BTN}${index}`}
      >
        Cancel
      </Button>
      <ErrorMessageDialog
        visible={errorVisible}
        handleClickError={handleClickError}
      >
        <Button
          className="edit-form-btn btn-margin-right"
          type="primary"
          onClick={onSave}
          aria-controls="name email"
          data-testid={`${ContactBtnTestIds.SAVE_BTN}${index}`}
        >
          Save
        </Button>
      </ErrorMessageDialog>
    </EditWrapper>
  );
};
