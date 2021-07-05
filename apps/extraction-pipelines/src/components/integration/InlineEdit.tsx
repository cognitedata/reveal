import React, { PropsWithChildren, useState } from 'react';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IntegrationFieldName } from 'model/Integration';
import MessageDialog from 'components/buttons/MessageDialog';
import {
  ContactBtnTestIds,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { DefaultValues } from 'react-hook-form/dist/types/form';
import {
  DetailsUpdateContext,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { DivFlex } from 'styles/flex/StyledFlex';
import ValidationError from 'components/form/ValidationError';
import { AnyObjectSchema } from 'yup';
import { ColumnForm, StyledInput, StyledLabel } from 'styles/StyledForm';
import { CloseButton, SaveButton, EditButton } from 'styles/StyledButton';
import { AddInfo } from './AddInfo';

export interface InlineEditProps<Fields> {
  defaultValues: DefaultValues<Fields>;
  schema: AnyObjectSchema;
  name: IntegrationFieldName;
  updateFn: (field: FieldValues) => DetailsUpdateContext;
  label: string;
  showLabel?: boolean;
  viewComp?: React.ReactNode;
  fullWidth?: boolean;
  marginBottom?: boolean;
  canEdit: boolean;
}

const InlineEdit = <Fields extends FieldValues>({
  schema,
  defaultValues,
  name,
  viewComp,
  showLabel,
  updateFn,
  label,
  fullWidth = false,
  marginBottom = false,
  canEdit,
}: PropsWithChildren<InlineEditProps<Fields>>) => {
  const [isEdit, setIsEdit] = useState(false);
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
  const onSave = async (field: FieldValues) => {
    const items = updateFn(field);
    await mutate(items, {
      onError: () => {
        setErrorVisible(true);
      },
      onSuccess: () => {
        setIsEdit(false);
      },
    });
  };

  const onEditClick = () => {
    if (canEdit) setIsEdit(true);
  };

  const handleClickError = () => {
    setErrorVisible(false);
  };

  const onCancel = () => {
    setIsEdit(false);
  };

  return (
    <ColumnForm onSubmit={handleSubmit(onSave)} marginBottom={marginBottom}>
      {showLabel && (
        <StyledLabel htmlFor={name} className="input-label">
          {label}
        </StyledLabel>
      )}
      {isEdit ? (
        <DivFlex direction="column" align="stretch">
          <ValidationError errors={errors} name={name} />
          <DivFlex>
            <Controller
              name={name}
              control={control}
              defaultValue={defaultValues[name]}
              render={({ field, fieldState }) => {
                return (
                  <StyledInput
                    id={name}
                    value={field.value as string}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    fullWidth={fullWidth}
                    aria-describedby={`${name}-error`}
                  />
                );
              }}
            />
            <MessageDialog
              visible={errorVisible}
              handleClickError={handleClickError}
              title={SERVER_ERROR_TITLE}
              contentText={SERVER_ERROR_CONTENT}
            >
              <SaveButton
                htmlType="submit"
                aria-controls={name}
                data-testid={`${ContactBtnTestIds.SAVE_BTN}${name}`}
              />
            </MessageDialog>
            <CloseButton
              onClick={onCancel}
              aria-controls={name}
              data-testid={`${ContactBtnTestIds.CANCEL_BTN}${name}`}
            />
          </DivFlex>
        </DivFlex>
      ) : (
        <EditButton
          onClick={onEditClick}
          title="Toggle edit row"
          aria-expanded={isEdit}
          aria-controls={name}
          disabled={!canEdit}
          data-testid={`${ContactBtnTestIds.EDIT_BTN}${name}`}
          $full={!!fullWidth}
        >
          {viewComp ?? (
            <AddInfo fieldValue={defaultValues[name]} fieldName={name} />
          )}
        </EditButton>
      )}
    </ColumnForm>
  );
};

export default InlineEdit;
