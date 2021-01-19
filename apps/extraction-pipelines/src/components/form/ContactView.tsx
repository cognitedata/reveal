import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { ArrayField } from 'react-hook-form';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';
import { createUpdateSpec } from 'utils/contactsUtils';
import ErrorMessageDialog from 'components/buttons/ErrorMessageDialog';
import { AlignedSpan, ContactBtnTestIds } from './ContactsView';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { useAppEnv } from '../../hooks/useAppEnv';
import EmailLink from '../buttons/EmailLink';
import {
  CONTACT_NOTIFICATION_TEST_ID,
  CANCEL,
  EMAIL_NOTIFICATION_TOOLTIP,
  REMOVE,
} from '../../utils/constants';
import { GridRowStyle } from '../../styles/grid/StyledGrid';
import { SwitchWithRef } from '../inputs/SwitchRef';
import { ContactEdit } from './ContactEdit';
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

export const ContactView: FunctionComponent<Props> = ({
  field,
  index,
  remove,
}: OwnProps) => {
  const {
    dispatch,
    state: { integration },
  } = useIntegration();
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [isEdit, setIsEdit] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const isNew =
    integration?.contacts[index]?.name === '' &&
    integration?.contacts[index]?.email === '';
  useEffect(() => {
    setIsEdit(isNew);
  }, [isNew]);

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

  const renderView = (innerIsEdit: boolean) => {
    if (innerIsEdit) {
      return <></>;
    }
    return (
      <GridRowStyle key={field?.id} className="row-style-even row-height-4">
        <AlignedSpan
          role="gridcell"
          aria-colindex={0}
          aria-describedby="contacts-heading-role"
        >
          {integration?.contacts[index]?.role}
        </AlignedSpan>
        <Tooltip
          content={EMAIL_NOTIFICATION_TOOLTIP}
          className="integration-tooltip"
        >
          <span className="checkbox-tool-tip-wrapper">
            <SwitchWithRef
              name={`contacts[${index}].sendNotification`}
              disabled
              handleChange={handleChange}
              defaultChecked={
                integration?.contacts[index]?.sendNotification ?? false
              }
              data-testid={`${CONTACT_NOTIFICATION_TEST_ID}${index}`}
              aria-label={EMAIL_NOTIFICATION_TOOLTIP}
            />
          </span>
        </Tooltip>

        <AlignedSpan
          role="gridcell"
          aria-colindex={2}
          aria-describedby="contacts-heading-name"
        >
          {integration?.contacts[index]?.name}
        </AlignedSpan>

        <AlignedSpan
          role="gridcell"
          aria-colindex={3}
          aria-describedby="contacts-heading-email"
        >
          <EmailLink email={integration?.contacts[index]?.email} />
        </AlignedSpan>
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
          aria-expanded={innerIsEdit}
          aria-controls="name email"
          data-testid={`${ContactBtnTestIds.EDIT_BTN}${index}`}
        >
          Edit
        </Button>
      </GridRowStyle>
    );
  };
  return (
    <>
      {renderView(isEdit)}
      {isEdit && (
        <ContactEdit field={field} index={index} setIsEdit={setIsEdit} />
      )}
    </>
  );
};
