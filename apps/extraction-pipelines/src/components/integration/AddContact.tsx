import React, { FunctionComponent, PropsWithoutRef, useState } from 'react';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@cognite/cogs.js';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  contactOwnerSchema,
  contactNotOwnerSchema,
} from 'utils/validation/integrationSchemas';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { User } from 'model/User';
import { useAppEnv } from 'hooks/useAppEnv';
import { InputError } from 'components/inputs/InputError';
import styled from 'styled-components';
import {
  ADD_CONTACT,
  ADD_OWNER,
  EMAIL_LABEL,
  NAME_LABEL,
  ROLE_LABEL,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { AddForm } from 'styles/StyledForm';
import MessageDialog from 'components/buttons/MessageDialog';
import { CloseButton, SaveButton, SwitchButton } from 'styles/StyledButton';
import { bottomSpacing, topSpacing } from 'styles/StyledVariables';

const StyledForm = styled(AddForm)`
  grid-template-columns: 10rem 6rem 1fr 1fr 3rem 2.5rem;
`;

const AddButton = styled(Button)`
  margin-top: ${topSpacing};
  margin-bottom: ${bottomSpacing};
  justify-self: start;
`;
interface AddContactProps {
  isOwner?: boolean;
}

export const AddContact: FunctionComponent<AddContactProps> = ({
  isOwner,
}: PropsWithoutRef<AddContactProps>) => {
  const { integration } = useSelectedIntegration();
  const { project } = useAppEnv();
  const { data: current } = useIntegrationById(integration?.id);
  const [addMode, setAddMode] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const { mutate } = useDetailsUpdate();
  const {
    control,
    formState: { errors },
    watch,
    handleSubmit,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(isOwner ? contactOwnerSchema : contactNotOwnerSchema),
  });

  const handleClick = () => {
    const v = getValues('sendNotification');
    setValue('sendNotification', !v);
  };

  const onAddContact = () => {
    setAddMode(true);
  };

  const onCancelClick = () => {
    setAddMode(false);
  };

  const onValid = async (values: User) => {
    if (current && project) {
      const items = createUpdateSpec({
        project,
        id: current.id,
        fieldValue: [...(current.contacts ?? []), values],
        fieldName: 'contacts',
      });
      await mutate(items, {
        onError: () => {
          setErrorVisible(true);
        },
        onSuccess: () => {
          reset();
          setAddMode(false);
        },
      });
    }
  };
  const handleClickError = () => {
    setErrorVisible(false);
  };

  return (
    <>
      {addMode ? (
        <StyledForm onSubmit={handleSubmit(onValid)}>
          <InputError
            name="role"
            control={control}
            errors={errors}
            defaultValue={isOwner ? 'Owner' : ''}
            inputId="role"
            labelText={ROLE_LABEL}
          />
          <Controller
            name="sendNotification"
            control={control}
            defaultValue={false}
            render={() => {
              return (
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
              );
            }}
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
            <SaveButton htmlType="submit" />
          </MessageDialog>

          <CloseButton className="edit-form-btn" onClick={onCancelClick} />
        </StyledForm>
      ) : (
        <AddButton type="tertiary" onClick={onAddContact}>
          {isOwner ? ADD_OWNER : ADD_CONTACT}
        </AddButton>
      )}
    </>
  );
};
