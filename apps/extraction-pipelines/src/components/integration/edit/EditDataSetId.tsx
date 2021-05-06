import React, { FunctionComponent, useEffect, useState } from 'react';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { dataSetIdSchema } from 'utils/validation/integrationSchemas';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import DataSetIdInput, {
  DATASET_LIST_LIMIT,
} from 'pages/create/DataSetIdInput';
import { useDataSetsList } from 'hooks/useDataSetsList';
import MessageDialog from 'components/buttons/MessageDialog';
import {
  BtnTestIds,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { CloseButton, SaveButton, StyledEdit } from 'styles/StyledButton';
import { AddInfo } from 'components/integration/AddInfo';
import { ColumnForm, StyledLabel } from 'styles/StyledForm';
import styled from 'styled-components';
import { DivFlex } from 'styles/flex/StyledFlex';
import { TableHeadings } from 'components/table/IntegrationTableCol';

const Wrapper = styled.div`
  display: grid;
  grid-template-areas: 'hint hint' 'error error' 'input btns';
  grid-template-columns: 1fr auto;
  .input-hint {
    margin-left: 1rem;
    grid-area: hint;
  }
  .cogs-select {
    width: 100%;
    grid-area: input;
    height: 2.25rem;
    margin: 0.125rem 1rem 0.125rem 0;
  }
  .input-btns {
    grid-area: btns;
  }
  .error-message {
    margin-left: 1rem;
    grid-area: error;
  }
`;

interface FormInput {
  dataSetId: number;
}

export const EditDataSetId: FunctionComponent = () => {
  const { project } = useAppEnv();
  const [isEdit, setIsEdit] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const { integration: selected } = useSelectedIntegration();
  const { data: integration } = useIntegrationById(selected?.id);
  const { data, status } = useDataSetsList(DATASET_LIST_LIMIT);
  const { mutate } = useDetailsUpdate();
  const methods = useForm<FormInput>({
    resolver: yupResolver(dataSetIdSchema),
    defaultValues: {
      dataSetId: integration?.dataSetId,
    },
    reValidateMode: 'onSubmit',
  });
  const { handleSubmit, register } = methods;
  useEffect(() => {
    register('dataSetId');
  }, [register]);
  if (!integration || !project) {
    return <p />;
  }

  const onSave = async (field: FormInput) => {
    if (integration && project) {
      const items = createUpdateSpec({
        project,
        id: integration.id,
        fieldValue: field.dataSetId,
        fieldName: 'dataSetId',
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
    <FormProvider {...methods}>
      <ColumnForm onSubmit={handleSubmit(onSave)} mb>
        <StyledLabel id="data-set-id-label" htmlFor="data-set-id">
          {TableHeadings.DATA_SET}
        </StyledLabel>
        {isEdit ? (
          <Wrapper>
            <DataSetIdInput data={data} status={status} autoFocus />
            <DivFlex className="input-btns">
              <MessageDialog
                visible={errorVisible}
                handleClickError={handleClickError}
                title={SERVER_ERROR_TITLE}
                contentText={SERVER_ERROR_CONTENT}
              >
                <SaveButton
                  htmlType="submit"
                  aria-controls="dataSetId"
                  data-testid={`${BtnTestIds.SAVE_BTN}dataSetId`}
                />
              </MessageDialog>
              <CloseButton
                onClick={onCancel}
                aria-controls="dataSetId"
                data-testid={`${BtnTestIds.CANCEL_BTN}dataSetId`}
              />
            </DivFlex>
          </Wrapper>
        ) : (
          <StyledEdit
            onClick={onEditClick}
            title="Toggle edit row"
            aria-expanded={isEdit}
            aria-controls="dataSetId"
            data-testid={`${BtnTestIds.EDIT_BTN}dataSetId`}
            $full
          >
            <AddInfo fieldValue={integration?.dataSet} fieldName="dataSet" />
          </StyledEdit>
        )}
      </ColumnForm>
    </FormProvider>
  );
};
