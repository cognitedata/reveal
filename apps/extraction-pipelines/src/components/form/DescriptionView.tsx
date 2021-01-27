import React, { FunctionComponent, useState } from 'react';
import { Button, Colors, Detail } from '@cognite/cogs.js';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';
import { StyledForm } from './NameView';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import { createUpdateSpec } from '../../utils/contactsUtils';
import ValidationError from './ValidationError';
import { InputWarningIcon } from '../icons/InputWarningIcon';
import { AlignedSpan } from './ContactsView';
import { DetailFieldNames } from '../../model/Integration';
import MessageDialog from '../buttons/MessageDialog';
import {
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from '../../utils/constants';

const DescriptionStyledForm = styled((props) => (
  <StyledForm {...props}>{props.children}</StyledForm>
))`
  height: 4rem;
  overflow: hidden;
  transition: height 0.66s ease-out;
  &.is-edit {
    height: 12rem;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 10rem;
  align-self: flex-end;
`;

const GridTextArea = styled((props) => <div {...props}>{props.children}</div>)`
  display: grid;
  grid-template-areas:
    'input input warning'
    'error count warning';
  textarea {
    grid-area: input;
  }
  .cogs-icon-Warning {
    grid-area: warning;
    grid-row-start: 1;
    grid-row-end: 3;
    align-self: center;
  }
  .error-message {
    grid-area: error;
  }
  .count {
    grid-area: count;
    text-align: right;
  }
`;
const CountSpan = styled((props) => <span {...props}>{props.children}</span>)`
  align-self: flex-start;
`;

interface OwnProps {}

type Props = OwnProps;
const MAX_DESC_LENGTH: Readonly<number> = 500;
const schema = yup.object().shape({
  description: yup
    .string()
    .required('Description is required')
    .max(
      MAX_DESC_LENGTH,
      `Description can only contain ${MAX_DESC_LENGTH} characters`
    ),
});

const DescriptionView: FunctionComponent<Props> = () => {
  const {
    state: { integration, updates },
    dispatch,
  } = useIntegration();
  const [isEdit, setIsEdit] = useState(false);
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [errorVisible, setErrorVisible] = useState(false);

  const { register, errors, getValues, trigger, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      description: integration?.description,
    },
  });
  const isDirty = updates.has(`description-0`);

  const onSave = async () => {
    const valid = await trigger();
    const description = getValues('description');
    if (valid && integration && project && description) {
      const items = createUpdateSpec({
        id: integration.id,
        fieldValue: description,
        fieldName: 'description',
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
            dispatch({ type: 'UPDATE_DESCRIPTION', payload: { description } });
            dispatch({
              type: 'REMOVE_CHANGE',
              payload: { name: 'description' },
            });
            setIsEdit(false);
          },
        }
      );
    }
  };

  function onCancel() {
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'description' } });
    setIsEdit(false);
  }

  const onEditClick = () => {
    setIsEdit(true);
  };

  const handleChange = () => {
    dispatch({ type: 'ADD_CHANGE', payload: { name: 'description' } });
  };

  const handleClickError = () => {
    setErrorVisible(false);
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'description' } });
    setIsEdit(false);
  };

  const count = watch('description')?.length ?? 0;
  return (
    <DescriptionStyledForm
      className={`row-style-even ${isEdit && 'is-edit'} row-height-4`}
    >
      <Detail strong>{DetailFieldNames.DESCRIPTION}</Detail>
      {isEdit ? (
        <GridTextArea>
          <StyledTextArea
            cols={30}
            rows={10}
            onChange={handleChange}
            id="description"
            name="description"
            placeholder="Enter a description of the integration"
            className={`cogs-input full-width ${
              errors.description ? 'has-error' : ''
            }`}
            ref={register}
            defaultValue={integration?.description}
          />
          {isDirty && (
            <InputWarningIcon
              $color={Colors.warning.hex()}
              data-testid="warning-icon-description"
              className="waring"
            />
          )}
          <ValidationError errors={errors} name="description" />
          <CountSpan className="count">
            {count}/{MAX_DESC_LENGTH}
          </CountSpan>
        </GridTextArea>
      ) : (
        <AlignedSpan data-testid="integration-description">
          {integration?.description}
        </AlignedSpan>
      )}
      {isEdit ? (
        <>
          <Button
            className="edit-form-btn"
            variant="default"
            onClick={onCancel}
            aria-controls="name"
          >
            Cancel
          </Button>
          <MessageDialog
            visible={errorVisible}
            handleClickError={handleClickError}
            title={SERVER_ERROR_TITLE}
            contentText={SERVER_ERROR_CONTENT}
          >
            <Button
              className="edit-form-btn btn-margin-right"
              type="primary"
              onClick={onSave}
              aria-controls="name"
            >
              Save
            </Button>
          </MessageDialog>
        </>
      ) : (
        <>
          <span />
          <Button
            onClick={onEditClick}
            className="edit-form-btn btn-margin-right"
            type="primary"
            title="Toggle edit row"
            aria-label="Edit btn should have label"
            aria-expanded={isEdit}
            aria-controls="description"
          >
            Edit
          </Button>
        </>
      )}
    </DescriptionStyledForm>
  );
};

export default DescriptionView;
