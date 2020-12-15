import React, { FunctionComponent, useState } from 'react';
import { Button, Colors, Detail } from '@cognite/cogs.js';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import ValidationError from './ValidationError';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import { createUpdateSpec } from '../../utils/contactsUtils';
import { InputWarningIcon } from '../inputs/InputWarningIcon';
import { AlignedSpan, GridRowStyle } from './ContactsView';
import { InputWarningError } from './ContactView';
import { DetailFieldNames } from '../../model/Integration';

interface OwnProps {}

type Props = OwnProps;
const OwnerGridRowStyle = styled((props) => (
  <GridRowStyle {...props}>{props.children}</GridRowStyle>
))`
  &:hover {
    background-color: ${Colors['greyscale-grey3'].hex()};
  }
`;

export const AlignedDetail = styled((props) => (
  <Detail {...props}>{props.children}</Detail>
))`
  align-self: center;
`;
const schema = yup.object().shape({
  name: yup.string().required('Owner name is required'),
  email: yup
    .string()
    .required('Owner email is required')
    .email('Owner email must be a valid email'),
});

interface OwnerForm extends FieldValues {
  name: string;
  email: string;
}

const OwnerView: FunctionComponent<Props> = () => {
  const {
    state: { integration },
    dispatch,
  } = useIntegration();
  const { project } = useAppEnv();
  const [mutateContacts] = useDetailsUpdate();
  const [isEdit, setIsEdit] = useState(false);

  const {
    register,
    errors,
    getValues,
    trigger,
    formState,
  } = useForm<OwnerForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: integration?.owner.name,
      email: integration?.owner.email,
    },
  });
  const isDirtyName = !!formState.dirtyFields.name;
  const isDirtyEmail = !!formState.dirtyFields.email;
  async function onSave() {
    const valid = await trigger();

    if (valid && project && integration) {
      const owner = getValues();
      const items = createUpdateSpec({
        id: integration.id,
        fieldName: 'owner',
        fieldValue: owner,
      });
      await mutateContacts({
        project,
        items,
        id: integration.id,
      });
      dispatch({ type: 'UPDATE_OWNER', payload: { owner } });
      dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'owner' } });

      setIsEdit(false);
    }
  }

  function onCancel() {
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'owner' } });
    setIsEdit(false);
  }

  const onEditClick = () => {
    setIsEdit(true);
  };

  const handleChange = () => {
    dispatch({ type: 'ADD_CHANGE', payload: { name: 'owner' } });
  };
  return (
    <>
      <OwnerGridRowStyle className="contact-row">
        <AlignedDetail strong>{DetailFieldNames.OWNER}</AlignedDetail>
        {isEdit ? (
          <InputWarningError>
            <input
              id="owner-name"
              name="name"
              type="text"
              placeholder="Enter name"
              onChange={handleChange}
              className={`cogs-input full-width ${
                errors.name ? 'has-error' : ''
              }`}
              ref={register}
              defaultValue={integration?.owner.name}
            />
            {isDirtyName && (
              <InputWarningIcon
                $color={Colors.warning.hex()}
                data-testid="warning-icon-owner-name"
                className="waring"
              />
            )}
            <ValidationError errors={errors} name="name" />
          </InputWarningError>
        ) : (
          <AlignedSpan>{integration?.owner.name}</AlignedSpan>
        )}

        {isEdit ? (
          <InputWarningError>
            <input
              id="owner-email"
              name="email"
              type="text"
              onChange={handleChange}
              placeholder="Enter email address"
              className={`cogs-input full-width ${
                errors.email ? 'has-error' : ''
              }`}
              ref={register}
              defaultValue={integration?.owner.email}
            />
            {isDirtyEmail && (
              <InputWarningIcon
                $color={Colors.warning.hex()}
                data-testid="warning-icon-owner-email"
                className="waring"
              />
            )}
            <ValidationError errors={errors} name="email" />
          </InputWarningError>
        ) : (
          <AlignedSpan>{integration?.owner.email}</AlignedSpan>
        )}

        {isEdit ? (
          <>
            <Button
              className="edit-form-btn"
              variant="default"
              onClick={onCancel}
              aria-controls="name email"
            >
              Cancel
            </Button>
            <Button
              className="edit-form-btn btn-margin-right"
              type="primary"
              onClick={onSave}
              aria-controls="name email"
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <span />
            <Button
              onClick={onEditClick}
              type="primary"
              className="edit-form-btn btn-margin-right"
              title="Toggle edit row"
              aria-label="Edit btn should have label"
              aria-expanded={isEdit}
              aria-controls="name email"
            >
              Edit
            </Button>
          </>
        )}
      </OwnerGridRowStyle>
    </>
  );
};

export default OwnerView;
