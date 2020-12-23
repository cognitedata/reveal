import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { ArrayField, useFormContext } from 'react-hook-form';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';
import { createUpdateSpec } from 'utils/contactsUtils';
import ErrorMessageDialog from 'components/buttons/ErrorMessageDialog';
import {
  AlignedDetail,
  AlignedSpan,
  ContactBtnTestIds,
  GridRowStyle,
} from './ContactsView';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { useAppEnv } from '../../hooks/useAppEnv';
import { InputWarningIcon } from '../inputs/InputWarningIcon';
import ValidationError from './ValidationError';
import { DetailFieldNames } from '../../model/Integration';
import { InputWarningError } from '../inputs/InputWithWarning';
import EmailLink from '../buttons/EmailLink';
import { User } from '../../model/User';

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
  const { register, errors, trigger, getValues } = useFormContext();
  const { project } = useAppEnv();
  const [mutateContacts] = useDetailsUpdate();
  const [isEdit, setIsEdit] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const isDirtyName = updates.has(`authors.name-${index}`);
  const isDirtyEmail = updates.has(`authors.email-${index}`);
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

      await mutateContacts(
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
              payload: { index, name: 'authors.name' },
            });
            dispatch({
              type: 'REMOVE_CHANGE',
              payload: { index, name: 'authors.email' },
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
      payload: { index, name: 'authors.name' },
    });
    dispatch({
      type: 'REMOVE_CHANGE',
      payload: { index, name: 'authors.email' },
    });
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
      await mutateContacts(
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === `authors[${index}].email`) {
      dispatch({
        type: 'ADD_CHANGE',
        payload: { index, name: 'authors.email' },
      });
    } else if (e.target.name === `authors[${index}].name`) {
      dispatch({
        type: 'ADD_CHANGE',
        payload: { index, name: 'authors.name' },
      });
    }
  };

  const handleClickError = () => {
    setErrorVisible(false);
    dispatch({
      type: 'REMOVE_CHANGE',
      payload: { index, name: 'authors.name' },
    });
    dispatch({
      type: 'REMOVE_CHANGE',
      payload: { index, name: 'authors.email' },
    });
    setIsEdit(false);
  };

  return (
    <GridRowStyle key={field?.id} className="row-style-odd row-height-4">
      <AlignedDetail strong>{DetailFieldNames.CONTACT}</AlignedDetail>
      {isEdit ? (
        <InputWarningError>
          <input
            key={field?.id}
            onChange={handleChange}
            name={`authors[${index}].name`}
            placeholder="Enter name"
            ref={register}
            className={`cogs-input full-width ${
              errors.authors?.[index]?.name ? 'has-error' : ''
            }`}
            data-testid={`authors-name-${index}`}
            defaultValue={integration?.authors[index]?.name}
          />
          {isDirtyName && (
            <InputWarningIcon
              $color={Colors.warning.hex()}
              data-testid={`warning-icon-author-${index}-name`}
              className="waring"
            />
          )}
          <ValidationError errors={errors} name={`authors[${index}].name`} />
        </InputWarningError>
      ) : (
        <AlignedSpan>{integration?.authors[index]?.name}</AlignedSpan>
      )}
      {isEdit ? (
        <InputWarningError>
          <input
            key={field.id}
            onChange={handleChange}
            name={`authors[${index}].email`}
            placeholder="Enter email address"
            ref={register}
            className={`cogs-input full-width ${
              errors.authors?.[index]?.email ? 'has-error' : ''
            }`}
            data-testid={`authors-email-${index}`}
            defaultValue={integration?.authors[index]?.email}
          />
          {isDirtyEmail && (
            <InputWarningIcon
              $color={Colors.warning.hex()}
              data-testid={`warning-icon-author-${index}-email`}
              className="waring"
            />
          )}
          <ValidationError errors={errors} name={`authors[${index}].email`} />
        </InputWarningError>
      ) : (
        <AlignedSpan>
          <EmailLink email={integration?.authors[index]?.email} />
        </AlignedSpan>
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
            aria-label="Edit btn should have label"
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
