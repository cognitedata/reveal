import React, { PropsWithChildren, useState } from 'react';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import {
  Controller,
  ControllerRenderProps,
  FieldValues,
  useForm,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Integration } from 'model/Integration';
import { EditButton } from 'styles/StyledForm';
import { Button, Icon, Input } from '@cognite/cogs.js';
import { DivFlex } from 'styles/flex/StyledFlex';
import ValidationError from 'components/form/ValidationError';
import MessageDialog from 'components/buttons/MessageDialog';
import {
  CLOSE,
  SAVE,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { DefaultValues } from 'react-hook-form/dist/types/form';
import { AnyObjectSchema } from 'yup';
import styled from 'styled-components';
import { updateContact } from 'utils/integrationUtils';

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
  const { control, handleSubmit, errors } = useForm<
    Record<string, unknown>,
    object
  >({
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

  function handleClickError() {
    setErrorVisible(false);
  }

  function onCancel() {
    setIsEdit(false);
  }

  return (
    <EditForm onSubmit={handleSubmit(onSave)}>
      {isEdit ? (
        <>
          <ValidationError errors={errors} name={`${field}`} />
          <Controller
            name={field}
            control={control}
            defaultValue={defaultValues[field] ?? ''}
            render={({ onChange, value }: ControllerRenderProps) => {
              return (
                <Input
                  id={`${name}${index}${field}`}
                  value={value}
                  onChange={onChange}
                  onBlur={handleSubmit(onSave)}
                  error={!!errors[field]}
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
              <Button
                className="edit-form-btn btn-margin-right"
                type="primary"
                htmlType="submit"
                aria-controls={`${name}${index}${field}`}
                aria-label={SAVE}
                data-testid={`${TestIds.SAVE_BTN}${index}${field}`}
              >
                <Icon type="Checkmark" />
              </Button>
            </MessageDialog>
            <Button
              variant="default"
              className="edit-form-btn"
              onClick={onCancel}
              aria-controls={`${name}${index}${field}`}
              aria-label={CLOSE}
              data-testid={`${TestIds.CANCEL_BTN}${index}${name}`}
            >
              <Icon type="Close" />
            </Button>
          </DivFlex>
        </>
      ) : (
        <EditButton
          onClick={onEditClick}
          title="Toggle edit"
          className="edit-btn full-width"
          aria-expanded={isEdit}
          aria-controls={field}
          aria-label={`Edit ${field}`}
          data-testid={`${TestIds.EDIT_BTN}${index}${name}`}
        >
          {defaultValues[field] ?? '-'}
        </EditButton>
      )}
    </EditForm>
  );
};
