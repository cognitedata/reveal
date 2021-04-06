import React, { PropsWithChildren, useState } from 'react';
import { Button, Detail, Icon, Input } from '@cognite/cogs.js';
import {
  Controller,
  ControllerRenderProps,
  FieldValues,
  useForm,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Integration, IntegrationFieldName } from 'model/Integration';
import { ContactBtnTestIds } from 'components/form/ContactsView';
import MessageDialog from 'components/buttons/MessageDialog';
import { SERVER_ERROR_CONTENT, SERVER_ERROR_TITLE } from 'utils/constants';
import { DefaultValues } from 'react-hook-form/dist/types/form';
import { createUpdateSpec, UpdateSpec } from 'utils/contactsUtils';
import { useAppEnv } from 'hooks/useAppEnv';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { DivFlex } from 'styles/flex/StyledFlex';
import ValidationError from 'components/form/ValidationError';
import { AnyObjectSchema } from 'yup';
import { EditButton, StyledForm } from 'styles/StyledForm';

export interface EditableFieldProps<Fields> {
  defaultValues: DefaultValues<Fields>;
  integration: Integration;
  schema: AnyObjectSchema;
  name: IntegrationFieldName;
  label: string;
  fullWidth?: boolean;
}

const EditableField = <Fields extends FieldValues>({
  integration,
  schema,
  defaultValues,
  name,
  label,
  fullWidth = false,
}: PropsWithChildren<EditableFieldProps<Fields>>) => {
  const [isEdit, setIsEdit] = useState(false);
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const { setIntegration } = useSelectedIntegration();
  const [errorVisible, setErrorVisible] = useState(false);

  const { control, handleSubmit, errors } = useForm<
    Record<string, unknown>,
    object
  >({
    resolver: yupResolver(schema),
    reValidateMode: 'onSubmit',
  });
  const onSave = async (field: FieldValues) => {
    const update: UpdateSpec = {
      id: integration.id,
      fieldValue: field[name],
      fieldName: name,
    };
    if (integration && project) {
      const items = createUpdateSpec(update);
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
            setIntegration((prev) => {
              return {
                ...(prev && prev),
                ...{ [update.fieldName]: update.fieldValue },
              } as Integration;
            });
            setIsEdit(false);
          },
        }
      );
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
    <StyledForm
      className="row-style-even row-height-4"
      onSubmit={handleSubmit(onSave)}
    >
      <Detail strong>{label}</Detail>
      {isEdit ? (
        <DivFlex direction="column" align="stretch">
          <ValidationError errors={errors} name={name} />
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValues[name]}
            render={({ onChange, value }: ControllerRenderProps) => {
              return (
                <Input
                  id={name}
                  value={value}
                  onChange={onChange}
                  error={!!errors[name]}
                  fullWidth={fullWidth}
                  aria-describedby={`${name}-error`}
                />
              );
            }}
          />
        </DivFlex>
      ) : (
        <EditButton
          onClick={onEditClick}
          title="Toggle edit row"
          aria-expanded={isEdit}
          aria-controls={name}
          data-testid={`${ContactBtnTestIds.EDIT_BTN}${name}`}
        >
          {defaultValues[name] ?? '-'}
        </EditButton>
      )}
      {isEdit && (
        <>
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
              aria-controls={name}
              aria-label="Save"
              data-testid={`${ContactBtnTestIds.SAVE_BTN}${name}`}
            >
              <Icon type="Checkmark" />
            </Button>
          </MessageDialog>
          <Button
            variant="default"
            className="edit-form-btn"
            onClick={onCancel}
            aria-controls={name}
            aria-label="Close"
            data-testid={`${ContactBtnTestIds.CANCEL_BTN}${name}`}
          >
            <Icon type="Close" />
          </Button>
        </>
      )}
    </StyledForm>
  );
};

export default EditableField;
