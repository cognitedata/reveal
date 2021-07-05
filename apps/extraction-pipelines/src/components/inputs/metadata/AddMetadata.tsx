import React, { FunctionComponent, useState } from 'react';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { useForm } from 'react-hook-form';
import { Button } from '@cognite/cogs.js';
import { yupResolver } from '@hookform/resolvers/yup';
import { metaDataSchema } from 'utils/validation/integrationSchemas';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { InputError } from 'components/inputs/InputError';
import styled from 'styled-components';
import {
  ADD_ROW,
  METADATA_CONTENT_LABEL,
  METADATA_DESCRIPTION_LABEL,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import MessageDialog from 'components/buttons/MessageDialog';
import { CloseButton, SaveButton } from 'styles/StyledButton';
import { AddForm } from 'styles/StyledForm';

const StyledForm = styled(AddForm)`
  grid-template-columns: 1fr 1fr 3rem 2.5rem;
`;

const AddButton = styled(Button)`
  margin-top: 1rem;
  align-self: flex-start;
`;

export const AddMetadata: FunctionComponent = () => {
  const { integration } = useSelectedIntegration();
  const { project } = useAppEnv();
  const { data: current } = useIntegrationById(integration?.id);
  const [addMode, setAddMode] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const { mutate } = useDetailsUpdate();
  const {
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: yupResolver(metaDataSchema),
  });

  const onAddMetadataRow = () => {
    setAddMode(true);
  };

  const onCancelClick = () => {
    setAddMode(false);
  };

  const onValid = async (values: { description: string; content: string }) => {
    if (current && project) {
      const key = values.description;
      const newMeta = {
        [key]: values.content,
      };
      const items = createUpdateSpec({
        project,
        id: current.id,
        fieldValue: { ...integration?.metadata, ...newMeta },
        fieldName: 'metadata',
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
            name="description"
            control={control}
            errors={errors}
            defaultValue=""
            inputId="description"
            labelText={METADATA_DESCRIPTION_LABEL}
          />
          <InputError
            name="content"
            control={control}
            errors={errors}
            defaultValue=""
            inputId="content"
            labelText={METADATA_CONTENT_LABEL}
          />
          <MessageDialog
            visible={errorVisible}
            handleClickError={handleClickError}
            title={SERVER_ERROR_TITLE}
            contentText={SERVER_ERROR_CONTENT}
          >
            <SaveButton htmlType="submit" />
          </MessageDialog>
          <CloseButton onClick={onCancelClick} />
        </StyledForm>
      ) : (
        <AddButton type="tertiary" onClick={onAddMetadataRow}>
          {ADD_ROW}
        </AddButton>
      )}
    </>
  );
};
