import React, { FunctionComponent, useState } from 'react';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { Controller, useForm } from 'react-hook-form';
import { Button, Icon } from '@cognite/cogs.js';
import { yupResolver } from '@hookform/resolvers/yup';
import { contactSchema } from 'utils/validation/integrationSchemas';
import {
  useDetailsUpdate,
  createUpdateSpec,
} from 'hooks/details/useDetailsUpdate';
import { User } from 'model/User';
import { useAppEnv } from 'hooks/useAppEnv';
import { InputError } from 'components/inputs/InputError';
import styled from 'styled-components';
import {
  ADD_CONTACT,
  CLOSE,
  EMAIL_LABEL,
  NAME_LABEL,
  ROLE_LABEL,
  SAVE,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { SwitchButton } from 'styles/StyledForm';
import MessageDialog from 'components/buttons/MessageDialog';

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: 10rem 6rem 1fr 1fr 3rem 3rem;
  grid-column-gap: 0.5rem;
  align-items: center;
  grid-template-rows: max-content;
  input {
    width: 100%;
  }
`;

const AddButton = styled(Button)`
  margin-top: 1rem;
  justify-self: start;
`;
interface AddContactProps {}

export const AddContact: FunctionComponent<AddContactProps> = () => {
  const { integration } = useSelectedIntegration();
  const { project } = useAppEnv();
  const { data: current } = useIntegrationById(integration?.id);
  const [addMode, setAddMode] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const { mutate } = useDetailsUpdate();
  const { control, errors, watch, handleSubmit, setValue, getValues } = useForm(
    {
      resolver: yupResolver(contactSchema),
    }
  );

  const handleClick = () => {
    const v = getValues('sendNotification');
    setValue('sendNotification', !v);
  };

  const onAddContact = () => {
    setAddMode(true);
  };
  function onCancelClick() {
    setAddMode(false);
  }

  const onValid = async (values: User) => {
    if (current && project) {
      const items = createUpdateSpec({
        project,
        id: current.id,
        fieldValue: [...current.contacts, values],
        fieldName: 'contacts',
      });
      await mutate(items, {
        onError: () => {
          setErrorVisible(true);
        },
        onSuccess: () => {
          setAddMode(false);
        },
      });
    }
  };
  function handleClickError() {
    setErrorVisible(false);
  }

  return (
    <>
      {addMode ? (
        <StyledForm onSubmit={handleSubmit(onValid)}>
          <InputError
            name="role"
            control={control}
            errors={errors}
            defaultValue=""
            inputId="role"
            labelText={ROLE_LABEL}
          />
          <Controller
            name="sendNotification"
            control={control}
            defaultValue={false}
            as={
              <SwitchButton
                id="sendNotification"
                role="switch"
                type="button"
                onClick={() => handleClick()}
                aria-checked={watch('sendNotification') ?? false}
                aria-labelledby="integration-contacts-notification-label"
              >
                <span className="on">On</span>
                <span className="off">Off</span>
              </SwitchButton>
            }
          />
          <InputError
            name="name"
            control={control}
            errors={errors}
            defaultValue=""
            inputId="name"
            labelText={NAME_LABEL}
          />
          <InputError
            name="email"
            control={control}
            errors={errors}
            defaultValue=""
            inputId="email"
            labelText={EMAIL_LABEL}
          />
          <MessageDialog
            visible={errorVisible}
            handleClickError={handleClickError}
            title={SERVER_ERROR_TITLE}
            contentText={SERVER_ERROR_CONTENT}
          >
            <Button
              className="edit-form-btn btn-margin-right"
              type="primary"
              htmlType="submit"
              aria-label={SAVE}
            >
              <Icon type="Checkmark" />
            </Button>
          </MessageDialog>

          <Button
            variant="default"
            className="edit-form-btn"
            aria-label={CLOSE}
            onClick={onCancelClick}
          >
            <Icon type="Close" />
          </Button>
        </StyledForm>
      ) : (
        <AddButton type="tertiary" onClick={onAddContact}>
          {ADD_CONTACT}
        </AddButton>
      )}
    </>
  );
};
