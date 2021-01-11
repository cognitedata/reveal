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
  EMAIL_NOTIFICATION_TOOLTIP,
  EMAIL_PLACEHOLDER,
  NAME_PLACEHOLDER,
} from '../../utils/constants';
import {
  AUTHOR_EMAIL_TEST_ID,
  AUTHOR_NAME_TEST_ID,
  AUTHOR_NOTIFICATION_TEST_ID,
} from '../../utils/test/utilsFn';
import { CheckboxWithRef } from '../inputs/CheckboxWithRef';
import { GridRowStyle } from '../../styles/grid/StyledGrid';

interface OwnProps {
  field: Partial<ArrayField<Record<string, any>, 'id'>>;
  index: number;
  remove: (index: number) => void;
}

type Props = OwnProps;

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
  const isDirty = updates.has(`authors-${index}`);
  const isNew =
    integration?.authors[index]?.name === '' &&
    integration?.authors[index]?.email === '';
  useEffect(() => {
    setIsEdit(isNew);
  }, [isNew]);

  async function onSave() {
    const valid = await trigger();
    if (valid && integration && project) {
      const aut = getValues();
      const actual = aut.authors[index];
      const authors = integration?.authors ?? [];
      const authorsToSave = authors.map((author: User, idx: number) => {
        if (idx === index) {
          return actual;
        }
        return author;
      });
      const items = createUpdateSpec({
        id: integration.id,
        fieldValue: authorsToSave,
        fieldName: 'authors',
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
              type: 'UPDATE_AUTHOR',
              payload: { index, author: actual },
            });
            dispatch({
              type: 'REMOVE_CHANGE',
              payload: { index, name: 'authors' },
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
      payload: { index, name: 'authors' },
    });
    setValue(
      `authors[${index}].sendNotification`,
      integration?.authors[index]?.sendNotification
    );
    setIsEdit(false);
  }

  const onEditClick = () => {
    setIsEdit(true);
  };

  const onRemoveClick = async () => {
    if (project && integration) {
      const authors = integration.authors.filter((_, idx) => idx !== index);
      const items = createUpdateSpec({
        id: integration.id,
        fieldName: 'authors',
        fieldValue: authors,
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
            dispatch({ type: 'REMOVE_AUTHOR', payload: { index } });
            remove(index);
          },
        }
      );
    }
  };

  const handleChange = (_: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'ADD_CHANGE',
      payload: { index, name: 'authors' },
    });
  };

  const handleClickError = () => {
    setErrorVisible(false);
    dispatch({
      type: 'REMOVE_CHANGE',
      payload: { index, name: 'authors' },
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
          name={`authors[${index}].sendNotification`}
          disabled={!isEdit}
          handleChange={handleChange}
          defaultChecked={integration?.authors[index]?.sendNotification}
          register={register}
          data-testid={`${AUTHOR_NOTIFICATION_TEST_ID}${index}`}
          aria-label={EMAIL_NOTIFICATION_TOOLTIP}
        />
      </Tooltip>
      {isEdit ? (
        <InputWarningError>
          <input
            key={field?.id}
            onChange={handleChange}
            name={`authors[${index}].name`}
            placeholder={NAME_PLACEHOLDER}
            ref={register}
            className={`cogs-input full-width ${
              errors.authors?.[index]?.name ? 'has-error' : ''
            }`}
            data-testid={`${AUTHOR_NAME_TEST_ID}${index}`}
            defaultValue={integration?.authors[index]?.name}
            aria-invalid={errors.authors?.[index]?.name ? 'true' : 'false'}
            aria-labelledby="contacts-heading-name"
          />
          <ValidationError errors={errors} name={`authors[${index}].name`} />
        </InputWarningError>
      ) : (
        <AlignedSpan
          role="gridcell"
          aria-colindex={2}
          aria-describedby="contacts-heading-name"
        >
          {integration?.authors[index]?.name}
        </AlignedSpan>
      )}
      {isEdit ? (
        <InputWarningError>
          <input
            key={field.id}
            onChange={handleChange}
            name={`authors[${index}].email`}
            placeholder={EMAIL_PLACEHOLDER}
            ref={register}
            className={`cogs-input full-width ${
              errors.authors?.[index]?.email ? 'has-error' : ''
            }`}
            data-testid={`${AUTHOR_EMAIL_TEST_ID}${index}`}
            defaultValue={integration?.authors[index]?.email}
            aria-invalid={errors.authors?.[index]?.email ? 'true' : 'false'}
            aria-labelledby="contacts-heading-email"
          />
          <ValidationError errors={errors} name={`authors[${index}].email`} />
        </InputWarningError>
      ) : (
        <AlignedSpan
          role="gridcell"
          aria-colindex={3}
          aria-describedby="contacts-heading-email"
        >
          <EmailLink email={integration?.authors[index]?.email} />
        </AlignedSpan>
      )}
      {isDirty ? (
        <InputWarningIcon
          $color={Colors.warning.hex()}
          data-testid={`warning-icon-authors-${index}`}
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
        </>
      ) : (
        <>
          <ErrorMessageDialog
            visible={errorVisible}
            handleClickError={handleClickError}
          >
            <Button onClick={onRemoveClick}>Remove</Button>
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
            Edit
          </Button>
        </>
      )}
    </GridRowStyle>
  );
};

export default ContactView;
