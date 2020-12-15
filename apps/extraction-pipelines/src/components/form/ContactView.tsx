import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { ArrayField, useFormContext } from 'react-hook-form';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';
import { createUpdateSpec } from 'utils/contactsUtils';
import styled from 'styled-components';
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
import RemoveEditBtns from '../test/RemoveEditBtns';
import { DetailFieldNames } from '../../model/Integration';

export const InputWarningError = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  display: grid;
  grid-template-columns: 1fr 2.5rem;
  grid-template-rows: min-content 1rem;
  align-self: flex-end;
  grid-template-areas: 'input warning' 'error error';
  input {
    align-self: flex-end;
  }
  .cogs-icon-Warning {
    grid-area: warning;
    align-self: flex-end;
    margin-bottom: 0.5rem;
  }
  .error-message {
    grid-area: error;
  }
`;
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
  const [isEdit, setIsEdit] = useState(true);
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
      const authorsToSave = authors.map((author, idx) => {
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
      await mutateContacts({
        project,
        items,
        id: integration.id,
      });
      dispatch({ type: 'UPDATE_AUTHOR', payload: { index, author: actual } }); // just send updated authors?
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
      await mutateContacts({
        project,
        items,
        id: integration.id,
      });
      dispatch({ type: 'REMOVE_AUTHOR', payload: { index } });
      remove(index);
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

  return (
    <GridRowStyle key={field.id} className="contact-row">
      <AlignedDetail strong>{DetailFieldNames.CONTACT}</AlignedDetail>
      {isEdit ? (
        <InputWarningError>
          <input
            key={field.id}
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
          <ValidationError
            errors={errors}
            name={`authors[${index}].name`}
            className="error-message"
          />
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
          <ValidationError
            errors={errors}
            name={`authors[${index}].email`}
            className="error-message"
          />
        </InputWarningError>
      ) : (
        <AlignedSpan>{integration?.authors[index]?.email}</AlignedSpan>
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
          <Button
            className="edit-form-btn btn-margin-right"
            type="primary"
            onClick={onSave}
            aria-controls="name email"
            data-testid={`${ContactBtnTestIds.SAVE_BTN}${index}`}
          >
            Save
          </Button>
        </>
      ) : (
        <RemoveEditBtns
          onRemoveClick={onRemoveClick}
          onEditClick={onEditClick}
          index={index}
          isEdit={isEdit}
        />
      )}
    </GridRowStyle>
  );
};

export default ContactView;
