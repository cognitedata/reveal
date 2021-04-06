import React, { PropsWithChildren, useState } from 'react';
import { Button, Detail, Icon } from '@cognite/cogs.js';
import {
  Controller,
  ControllerRenderProps,
  FieldValues,
  useForm,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import { Integration } from 'model/Integration';
import { ContactBtnTestIds } from 'components/form/ContactsView';
import MessageDialog from 'components/buttons/MessageDialog';
import { SERVER_ERROR_CONTENT, SERVER_ERROR_TITLE } from 'utils/constants';
import { createUpdateSpec, UpdateSpec } from 'utils/contactsUtils';
import { useAppEnv } from 'hooks/useAppEnv';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';
import { bottomSpacing } from 'styles/StyledVariables';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { DivFlex } from 'styles/flex/StyledFlex';
import ValidationError from 'components/form/ValidationError';
import { EditButton, StyledForm, StyledTextArea } from 'styles/StyledForm';

import { CountSpan } from 'components/form/DescriptionView';
import { EditableFieldProps } from 'components/integration/EditableField';

interface Props<Fields>
  extends Pick<
    EditableFieldProps<Fields>,
    'defaultValues' | 'schema' | 'name' | 'label' | 'integration'
  > {
  maxCount?: number;
}
const StyledTextAreaWithCounter = styled(StyledTextArea)`
  padding-top: 0.5rem;
  margin: ${bottomSpacing} 0 0.3rem 0;
`;

const TextAreaField = <Fields extends FieldValues>({
  integration,
  schema,
  defaultValues,
  name,
  label,
  maxCount,
}: PropsWithChildren<Props<Fields>>) => {
  const [isEdit, setIsEdit] = useState(false);
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const { setIntegration } = useSelectedIntegration();
  const [errorVisible, setErrorVisible] = useState(false);

  const { control, handleSubmit, errors, watch } = useForm({
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
  const count = watch(name)?.length ?? 0;
  return (
    <StyledForm
      className={`row-style-even row-height-4 ${isEdit ? 'expands' : ''}`}
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
                <StyledTextAreaWithCounter
                  id={name}
                  value={value}
                  onChange={onChange}
                  className={`cogs-input ${errors[name] ? 'has-error' : ''}`}
                  aria-describedby={`${name}-error`}
                />
              );
            }}
          />
          {maxCount && (
            <CountSpan className="count">
              {count}/{maxCount}
            </CountSpan>
          )}
        </DivFlex>
      ) : (
        <EditButton
          onClick={onEditClick}
          title="Toggle edit row"
          icon="Edit"
          iconPlacement="right"
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

export default TextAreaField;
