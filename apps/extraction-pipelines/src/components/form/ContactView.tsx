import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Popconfirm, Tooltip } from '@cognite/cogs.js';
import { ArrayField } from 'react-hook-form';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';
import { createUpdateSpec } from 'utils/contactsUtils';
import { isValidContactListAfterRemove } from 'utils/validation/contactValidation';
import { AlignedSpan, ContactBtnTestIds } from './ContactsView';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { useAppEnv } from '../../hooks/useAppEnv';
import EmailLink from '../buttons/EmailLink';
import {
  CONTACT_NOTIFICATION_TEST_ID,
  CANCEL,
  EMAIL_NOTIFICATION_TOOLTIP,
  REMOVE,
  EDIT,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
  NOTIFICATION_DIALOG_TITLE,
  NOTIFICATION_DIALOG_CONTENT,
  REMOVE_DIALOG_TEXT_PART,
} from '../../utils/constants';
import { GridRowStyle } from '../../styles/grid/StyledGrid';
import { SwitchWithRef } from '../inputs/SwitchRef';
import { ContactEdit } from './ContactEdit';
import MessageDialog from '../buttons/MessageDialog';

interface OwnProps {
  field: Partial<ArrayField<Record<string, any>, 'id'>>;
  index: number;
  remove: (index: number) => void;
}

type Props = OwnProps;
function confirmRemoveContact(contact?: string) {
  return `${REMOVE_DIALOG_TEXT_PART} ${
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
  const [showNotValidContacts, setShowNotValidContacts] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

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

  const onClickRemove = () => {
    if (!isValidContactListAfterRemove(integration, index)) {
      setShowNotValidContacts(true);
    } else {
      setShowRemoveDialog(true);
    }
  };

  const renderRemoveButton = () => {
    if (showNotValidContacts) {
      return (
        <MessageDialog
          visible={showNotValidContacts}
          handleClickError={() => {
            setShowNotValidContacts(false);
          }}
          title={NOTIFICATION_DIALOG_TITLE}
          contentText={NOTIFICATION_DIALOG_CONTENT}
        >
          <Button
            onClick={onClickRemove}
            data-testid={`${ContactBtnTestIds.REMOVE_BTN}${index}`}
          >
            {REMOVE}
          </Button>
        </MessageDialog>
      );
    }
    if (errorVisible) {
      return (
        <MessageDialog
          visible={errorVisible}
          handleClickError={handleClickError}
          title={SERVER_ERROR_TITLE}
          contentText={SERVER_ERROR_CONTENT}
        >
          <Button
            onClick={onClickRemove}
            data-testid={`${ContactBtnTestIds.REMOVE_BTN}${index}`}
          >
            {REMOVE}
          </Button>
        </MessageDialog>
      );
    }
    if (showRemoveDialog) {
      return (
        <Popconfirm
          visible={showRemoveDialog}
          onConfirm={onRemoveClick}
          content={confirmRemoveContact(integration?.contacts[index]?.name)}
          onCancel={() => setShowRemoveDialog(false)}
          cancelText={CANCEL}
          okText={REMOVE}
          placement="top"
          icon="Warning"
        >
          <Button
            onClick={onClickRemove}
            data-testid={`${ContactBtnTestIds.REMOVE_BTN}${index}`}
          >
            {REMOVE}
          </Button>
        </Popconfirm>
      );
    }
    return (
      <Button
        onClick={onClickRemove}
        data-testid={`${ContactBtnTestIds.REMOVE_BTN}${index}`}
      >
        {REMOVE}
      </Button>
    );
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
        {renderRemoveButton()}
        <Button
          onClick={onEditClick}
          type="primary"
          className="edit-form-btn btn-margin-right"
          title="Toggle edit row"
          aria-expanded={innerIsEdit}
          aria-controls="name email"
          data-testid={`${ContactBtnTestIds.EDIT_BTN}${index}`}
        >
          {EDIT}
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
