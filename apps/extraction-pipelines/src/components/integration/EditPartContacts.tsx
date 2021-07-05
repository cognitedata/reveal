import React, { PropsWithChildren, useState } from 'react';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Integration } from 'model/Integration';
import { Input } from '@cognite/cogs.js';
import { DivFlex } from 'styles/flex/StyledFlex';
import ValidationError from 'components/form/ValidationError';
import MessageDialog from 'components/buttons/MessageDialog';
import { SERVER_ERROR_CONTENT, SERVER_ERROR_TITLE } from 'utils/constants';
import { DefaultValues } from 'react-hook-form/dist/types/form';
import { AnyObjectSchema } from 'yup';
import styled from 'styled-components';
import { updateContact } from 'utils/integrationUtils';
import { CloseButton, SaveButton, EditButton } from 'styles/StyledButton';

export enum TestIds {
  SAVE_BTN = 'save-btn',
  EDIT_BTN = 'edit-btn',
  CANCEL_BTN = 'close-btn',
}
const EditForm = styled.form`
  display: grid;
  grid-template-areas: 'error error' 'input input' '. buttons';
  padding: 0.5rem;
  .error-message {
    grid-area: error;
  }
  .cogs-input,
  .cogs-input-container {
    grid-area: input;
  }
  .cogs-input-container {
    .input-wrapper {
      width: 100%;
      input {
        width: 100%;
      }
    }
  }
  .confirm-btns {
    grid-area: buttons;
    justify-self: end;
  }
  .edit-btn {
    grid-area: input;
  }
`;
interface EditPartOfArrayProps<Fields> {
  defaultValues: DefaultValues<Fields>;
  integration: Integration;
  schema: AnyObjectSchema;
  name: keyof Integration;
  field: string;
  index: number;
  label: string;
  fullWidth?: boolean;
}

export const EditPartContacts = <Fields extends FieldValues>({
  integration,
  schema,
  defaultValues,
  name,
  field,
  index,
  label,
  fullWidth = false,
}: PropsWithChildren<EditPartOfArrayProps<Fields>>) => {
  const [isEdit, setIsEdit] = useState(false);
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [errorVisible, setErrorVisible] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>, object>({
    resolver: yupResolver(schema),
    reValidateMode: 'onSubmit',
  });
  const onSave = async (fieldValue: FieldValues) => {
    if (integration && project) {
      const items = createUpdateSpec({
        project,
        id: integration.id,
        fieldValue: updateContact(integration.contacts, fieldValue, index),
        fieldName: name,
      });
      await mutate(items, {
        onError: () => {
          setErrorVisible(true);
        },
        onSuccess: () => {
          setIsEdit(false);
        },
      });
    }
  };

  const onEditClick = () => {
    setIsEdit(true);
  };

  const handleClickError = () => {
    setErrorVisible(false);
  };

  const onCancel = () => {
    setIsEdit(false);
  };

  return (
    <EditForm onSubmit={handleSubmit(onSave)}>
      {isEdit ? (
        <>
          <ValidationError errors={errors} name={`${field}`} />
          <Controller
            name={field}
            control={control}
            defaultValue={defaultValues[field] ?? ''}
            render={({ field: renderField, fieldState }) => {
              return (
                <Input
                  id={`${name}${index}${field}`}
                  value={renderField.value as string}
                  onChange={renderField.onChange}
                  onBlur={handleSubmit(onSave)}
                  error={!!fieldState.error}
                  fullWidth={fullWidth}
                  aria-label={`${label}`}
                  aria-describedby={`${name}-error`}
                />
              );
            }}
          />
          <DivFlex className="confirm-btns">
            <MessageDialog
              visible={errorVisible}
              handleClickError={handleClickError}
              title={SERVER_ERROR_TITLE}
              contentText={SERVER_ERROR_CONTENT}
            >
              <SaveButton
                htmlType="submit"
                aria-controls={`${name}${index}${field}`}
                data-testid={`${TestIds.SAVE_BTN}${index}${field}`}
              />
            </MessageDialog>
            <CloseButton
              onClick={onCancel}
              aria-controls={`${name}${index}${field}`}
              data-testid={`${TestIds.CANCEL_BTN}${index}${name}`}
            />
          </DivFlex>
        </>
      ) : (
        <EditButton
          onClick={onEditClick}
          title="Toggle edit"
          className="edit-btn"
          aria-expanded={isEdit}
          aria-controls={field}
          aria-label={`Edit ${field}`}
          data-testid={`${TestIds.EDIT_BTN}${index}${name}`}
          $full
        >
          {defaultValues[field] ?? '-'}
        </EditButton>
      )}
    </EditForm>
  );
};
