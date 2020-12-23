import React, { FunctionComponent, useState } from 'react';
import { Button, Colors, Detail } from '@cognite/cogs.js';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import InputWithWarning from 'components/inputs/InputWithWarning';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import { createUpdateSpec } from '../../utils/contactsUtils';
import { AlignedSpan, GridRowStyle } from './ContactsView';
import { DetailFieldNames } from '../../model/Integration';
import ErrorMessageDialog from '../buttons/ErrorMessageDialog';
import EmailLink from '../buttons/EmailLink';

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
  const [errorVisible, setErrorVisible] = useState(false);

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
            dispatch({ type: 'UPDATE_OWNER', payload: { owner } });
            dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'owner' } });
            setIsEdit(false);
          },
        }
      );
    }
  }

  function onCancel() {
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'owner' } });
    setIsEdit(false);
  }
  const handleClickError = () => {
    setErrorVisible(false);
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'owner' } });
    setIsEdit(false);
  };

  const onEditClick = () => {
    setIsEdit(true);
  };

  const handleChange = () => {
    dispatch({ type: 'ADD_CHANGE', payload: { name: 'owner' } });
  };
  return (
    <>
      <OwnerGridRowStyle className="row-style-odd">
        <AlignedDetail strong>{DetailFieldNames.OWNER}</AlignedDetail>
        {isEdit ? (
          <InputWithWarning
            name="name"
            placeholder="Enter name"
            handleChange={handleChange}
            register={register}
            defaultValue={integration?.owner.name}
            isDirty={isDirtyName}
            errors={errors}
          />
        ) : (
          <AlignedSpan>{integration?.owner.name}</AlignedSpan>
        )}

        {isEdit ? (
          <InputWithWarning
            name="email"
            placeholder="Enter email address"
            handleChange={handleChange}
            register={register}
            defaultValue={integration?.owner.email}
            isDirty={isDirtyEmail}
            errors={errors}
          />
        ) : (
          <AlignedSpan>
            <EmailLink email={integration?.owner.email} />
          </AlignedSpan>
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
            <ErrorMessageDialog
              visible={errorVisible}
              handleClickError={handleClickError}
            >
              <Button
                className="edit-form-btn btn-margin-right"
                type="primary"
                onClick={onSave}
                aria-controls="name email"
              >
                Save
              </Button>
            </ErrorMessageDialog>
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
