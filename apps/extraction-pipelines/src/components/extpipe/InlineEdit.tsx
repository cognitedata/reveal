import React, { PropsWithChildren, useState } from 'react';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ExtpipeFieldName } from 'model/Extpipe';
import MessageDialog from 'components/buttons/MessageDialog';
import { ContactBtnTestIds } from 'utils/constants';
import { DefaultValues } from 'react-hook-form/dist/types/form';
import {
  DetailsUpdateContext,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { DivFlex } from 'components/styled';
import ValidationError from 'components/form/ValidationError';
import { AnyObjectSchema } from 'yup';
import { ColumnForm, Hint, StyledInput, StyledLabel } from 'components/styled';
import { CloseButton, EditButton, SaveButton } from 'components/styled';
import { Colors } from '@cognite/cogs.js';
import { trackUsage } from 'utils/Metrics';
import { AddInfo } from './AddInfo';
import { useTranslation } from 'common';
import { CogniteError } from '@cognite/sdk';

export interface InlineEditProps<Fields> {
  defaultValues: DefaultValues<Fields>;
  schema: AnyObjectSchema;
  name: ExtpipeFieldName;
  updateFn: (field: FieldValues) => DetailsUpdateContext;
  label: string;
  showLabel?: boolean;
  viewComp?: React.ReactNode;
  fullWidth?: boolean;
  marginBottom?: boolean;
  canEdit: boolean;
  hintText?: string;
  placeholder?: string;
}

const InlineEdit = <Fields extends FieldValues>({
  schema,
  defaultValues,
  name,
  viewComp,
  showLabel,
  updateFn,
  hintText,
  placeholder,
  label,
  fullWidth = false,
  marginBottom = false,
  canEdit,
}: PropsWithChildren<InlineEditProps<Fields>>) => {
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const { mutate } = useDetailsUpdate();
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

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
    trackUsage({ t: 'EditField.Save', field: name });
    await mutate(items, {
      onError: (err: CogniteError) => {
        trackUsage({ t: 'EditField.Rejected', field: name });
        setErrorMessage(
          err?.duplicated
            ? t('duplicate-label', { label: label.toLowerCase() })
            : t('server-err-desc')
        );
      },
      onSuccess: () => {
        trackUsage({ t: 'EditField.Completed', field: name });
        setIsEdit(false);
      },
    });
  };

  const onEditClick = () => {
    if (canEdit) {
      trackUsage({ t: 'EditField.Start', field: name });
      setIsEdit(true);
    }
  };

  const handleClickError = () => {
    setErrorMessage(null);
  };

  const onCancel = () => {
    trackUsage({ t: 'EditField.Cancel', field: name });
    setIsEdit(false);
  };

  const actualValue = defaultValues[name];
  return (
    <ColumnForm onSubmit={handleSubmit(onSave)} marginBottom={marginBottom}>
      {showLabel && (
        <StyledLabel htmlFor={name} className="input-label">
          {label}
        </StyledLabel>
      )}
      {isEdit ? (
        <DivFlex direction="column" align="stretch">
          {hintText && (
            <Hint id="data-set-id-hint" className="input-hint">
              {hintText}
            </Hint>
          )}
          <ValidationError errors={errors} name={name} />
          <DivFlex css="gap: 0.5rem">
            <Controller
              name={name}
              control={control}
              defaultValue={actualValue}
              render={({ field, fieldState }) => {
                return (
                  <StyledInput
                    id={name}
                    placeholder={placeholder}
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
              visible={errorMessage != null}
              handleClickError={handleClickError}
              title={t('server-err-title')}
              contentText={errorMessage || ''}
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
        <>
          {canEdit ? (
            <EditButton
              showPencilIcon={actualValue != null}
              onClick={onEditClick}
              title={t('toggle-edit-row')}
              aria-expanded={isEdit}
              aria-controls={name}
              disabled={!canEdit}
              data-testid={`${ContactBtnTestIds.EDIT_BTN}${name}`}
              $full={!!fullWidth}
            >
              {viewComp ?? (
                <AddInfo fieldValue={actualValue} fieldName={name} />
              )}
            </EditButton>
          ) : (
            <div css="padding: 0 1rem">
              {viewComp != null ? (
                viewComp
              ) : (
                <>
                  {actualValue && actualValue !== '' ? (
                    <span>{actualValue}</span>
                  ) : (
                    <span style={{ color: Colors['greyscale-grey6'] }}>
                      {t('no-field-added', { field: name })}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </ColumnForm>
  );
};

export default InlineEdit;
