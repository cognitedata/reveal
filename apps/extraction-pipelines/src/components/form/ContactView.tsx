import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Colors, Tooltip } from '@cognite/cogs.js';
import { ArrayField, useFormContext } from 'react-hook-form';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';
import { createUpdateSpec } from 'utils/contactsUtils';
import ErrorMessageDialog from 'components/buttons/ErrorMessageDialog';
import { AlignedDetail, AlignedSpan, ContactBtnTestIds } from './ContactsView';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { useAppEnv } from '../../hooks/useAppEnv';
import { InputWarningIcon } from '../icons/InputWarningIcon';
import ValidationError from './ValidationError';
import { DetailFieldNames } from '../../model/Integration';
import { InputWarningError } from '../inputs/InputWithWarning';
import EmailLink from '../buttons/EmailLink';
import { User } from '../../model/User';
import {
  CANCEL,
  EDIT,
  EMAIL_NOTIFICATION_TOOLTIP,
  EMAIL_PLACEHOLDER,
  NAME_PLACEHOLDER,
  REMOVE,
  SAVE,
} from '../../utils/constants';
import {
  CONTACT_EMAIL_TEST_ID,
  CONTACT_NAME_TEST_ID,
  CONTACT_NOTIFICATION_TEST_ID,
} from '../../utils/test/utilsFn';
import { CheckboxWithRef } from '../inputs/CheckboxWithRef';
import { GridRowStyle } from '../../styles/grid/StyledGrid';
import { ConfirmDialogButton } from '../buttons/ConfirmDialogButton';

interface OwnProps {
  field: Partial<ArrayField<Record<string, any>, 'id'>>;
  index: number;
  remove: (index: number) => void;
}

type Props = OwnProps;

function confirmRemoveContact(contact?: string) {
  return `Are you sure you want to remove ${
    contact ? `${contact} as contact?` : 'contact?'
  }`;
}

const ContactView: FunctionComponent<Props> = ({
  field,
  index,
  remove,
}: OwnProps) => {
  const {
    dispatch,
    state: { integration, updates },
  } = useIntegration();
  const { register, errors, trigger, getValues, setValue } = useFormContext();
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [isEdit, setIsEdit] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const isDirty = updates.has(`contacts-${index}`);
  const isNew =
    integration?.contacts[index]?.name === '' &&
    integration?.contacts[index]?.email === '';
  useEffect(() => {
    setIsEdit(isNew);
  }, [isNew]);

  async function onSave() {
    const valid = await trigger();
    if (valid && integration && project) {
      const aut = getValues();
      const actual = aut.contacts[index];
      const contacts = integration?.contacts ?? [];
      const contactsToSave = contacts.map((author: User, idx: number) => {
        if (idx === index) {
          return actual;
        }
        return author;
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

  const onEditClick = () => {
    setIsEdit(true);
  };

  const onRemoveClick = async () => {
    if (project && integration) {
      const contacts = integration.contacts.filter((_, idx) => idx !== index);
      const items = createUpdateSpec({
        id: integration.id,
        fieldName: 'contacts',
        fieldValue: contacts,
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
            dispatch({ type: 'REMOVE_CONTACT', payload: { index } });
            remove(index);
          },
        }
      );
    }
  };

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
    <GridRowStyle key={field?.id} className="row-style-even row-height-4">
      <AlignedDetail strong role="gridcell" aria-colindex={1}>
        {DetailFieldNames.CONTACT}
      </AlignedDetail>
      <Tooltip content={EMAIL_NOTIFICATION_TOOLTIP} disabled={isEdit}>
        <CheckboxWithRef
          name={`contacts[${index}].sendNotification`}
          disabled={!isEdit}
          handleChange={handleChange}
          defaultChecked={integration?.contacts[index]?.sendNotification}
          register={register}
          data-testid={`${CONTACT_NOTIFICATION_TEST_ID}${index}`}
          aria-label={EMAIL_NOTIFICATION_TOOLTIP}
        />
      </Tooltip>
      {isEdit ? (
        <InputWarningError>
          <input
            key={field?.id}
            onChange={handleChange}
            name={`contacts[${index}].name`}
            placeholder={NAME_PLACEHOLDER}
            ref={register}
            className={`cogs-input full-width ${
              errors.contacts?.[index]?.name ? 'has-error' : ''
            }`}
            data-testid={`${CONTACT_NAME_TEST_ID}${index}`}
            defaultValue={integration?.contacts[index]?.name}
            aria-invalid={errors.contacts?.[index]?.name ? 'true' : 'false'}
            aria-labelledby="contacts-heading-name"
          />
          <ValidationError errors={errors} name={`contacts[${index}].name`} />
        </InputWarningError>
      ) : (
        <AlignedSpan
          role="gridcell"
          aria-colindex={2}
          aria-describedby="contacts-heading-name"
        >
          {integration?.contacts[index]?.name}
        </AlignedSpan>
      )}
      {isEdit ? (
        <InputWarningError>
          <input
            key={field.id}
            onChange={handleChange}
            name={`contacts[${index}].email`}
            placeholder={EMAIL_PLACEHOLDER}
            ref={register}
            className={`cogs-input full-width ${
              errors.contacts?.[index]?.email ? 'has-error' : ''
            }`}
            data-testid={`${CONTACT_EMAIL_TEST_ID}${index}`}
            defaultValue={integration?.contacts[index]?.email}
            aria-invalid={errors.contacts?.[index]?.email ? 'true' : 'false'}
            aria-labelledby="contacts-heading-email"
          />
          <ValidationError errors={errors} name={`contacts[${index}].email`} />
        </InputWarningError>
      ) : (
        <AlignedSpan
          role="gridcell"
          aria-colindex={3}
          aria-describedby="contacts-heading-email"
        >
          <EmailLink email={integration?.contacts[index]?.email} />
        </AlignedSpan>
      )}
      {isDirty ? (
        <InputWarningIcon
          $color={Colors.warning.hex()}
          data-testid={`warning-icon-contacts-${index}`}
          className="waring"
        />
      ) : (
        <span />
      )}
      {isEdit ? (
        <>
          <Button
            variant="default"
            className="edit-form-btn"
            onClick={onCancel}
            aria-controls="name email"
            data-testid={`${ContactBtnTestIds.CANCEL_BTN}${index}`}
          >
            {CANCEL}
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
              {SAVE}
            </Button>
          </ErrorMessageDialog>
        </>
      ) : (
        <>
          <ErrorMessageDialog
            visible={errorVisible}
            handleClickError={handleClickError}
          >
            <ConfirmDialogButton
              primaryText={REMOVE}
              cancelText={CANCEL}
              okText={REMOVE}
              onClick={onRemoveClick}
              popConfirmContent={confirmRemoveContact(
                integration?.contacts[index]?.name
              )}
              testId={`remove-contact-btn-${index}`}
            />
          </ErrorMessageDialog>
          <Button
            onClick={onEditClick}
            type="primary"
            className="edit-form-btn btn-margin-right"
            title="Toggle edit row"
            aria-expanded={isEdit}
            aria-controls="name email"
            data-testid={`${ContactBtnTestIds.EDIT_BTN}${index}`}
          >
            {EDIT}
          </Button>
        </>
      )}
    </GridRowStyle>
  );
};

export default ContactView;
