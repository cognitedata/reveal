import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { dataSetIdSchema } from 'utils/validation/extpipeSchemas';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import DataSetIdInput, {
  DATASET_LIST_LIMIT,
} from 'pages/create/DataSetIdInput';
import { useDataSetsList } from 'hooks/useDataSetsList';
import MessageDialog from 'components/buttons/MessageDialog';
import { BtnTestIds } from 'utils/constants';
import { CloseButton, EditButton, SaveButton } from 'components/styled';
import { AddInfo } from 'components/extpipe/AddInfo';
import { ColumnForm, StyledLabel } from 'components/styled';
import styled from 'styled-components';
import { DivFlex } from 'components/styled';
import DetailsValueView from 'components/table/details/DetailsValueView';
import { trackUsage } from 'utils/Metrics';
import { getProject } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';
interface FormInput {
  dataSetId: number;
}

export const EditDataSetId: FunctionComponent<{ canEdit: boolean }> = ({
  canEdit,
}) => {
  const { t } = useTranslation();
  const project = getProject();
  const [isEdit, setIsEdit] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: extpipe } = useExtpipeById(selected?.id);
  const { data, status } = useDataSetsList(DATASET_LIST_LIMIT);
  const { mutate } = useDetailsUpdate();
  const methods = useForm<FormInput>({
    resolver: yupResolver(dataSetIdSchema),
    defaultValues: {
      dataSetId: extpipe?.dataSetId,
    },
    reValidateMode: 'onSubmit',
  });
  const { handleSubmit, register } = methods;
  useEffect(() => {
    register('dataSetId');
  }, [register]);

  const onSave = async (field: FormInput) => {
    if (extpipe && project) {
      trackUsage({ t: 'EditField.Save', field: 'dataSet' });
      const items = createUpdateSpec({
        project,
        id: extpipe.id,
        fieldValue: field.dataSetId,
        fieldName: 'dataSetId',
      });
      await mutate(items, {
        onError: () => {
          trackUsage({ t: 'EditField.Rejected', field: 'dataSet' });
          setErrorVisible(true);
        },
        onSuccess: () => {
          trackUsage({ t: 'EditField.Completed', field: 'dataSet' });
          setIsEdit(false);
        },
      });
    }
  };

  const onEditClick = () => {
    if (canEdit) {
      trackUsage({ t: 'EditField.Start', field: 'dataSet' });
      setIsEdit(true);
    }
  };

  const handleClickError = () => {
    setErrorVisible(false);
  };

  const onCancel = () => {
    trackUsage({ t: 'EditField.Cancel', field: 'dataSet' });
    setIsEdit(false);
  };

  if (!extpipe || !project) {
    return <p />;
  }
  if (!canEdit) {
    return (
      <div css="padding: 0 1rem; margin-bottom: 1rem">
        <StyledLabel id="data-set-id-label" htmlFor="data-set-id">
          {t('data-set')}
        </StyledLabel>
        <DetailsValueView fieldName="dataSet" fieldValue={extpipe.dataSet} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <ColumnForm onSubmit={handleSubmit(onSave)} marginBottom>
        <StyledLabel id="data-set-id-label" htmlFor="data-set-id">
          {t('data-set')}
        </StyledLabel>
        {isEdit ? (
          <Wrapper>
            <DataSetIdInput data={data} status={status} autoFocus />
            <DivFlex className="input-btns" css="gap: 0.5rem">
              <MessageDialog
                visible={errorVisible}
                handleClickError={handleClickError}
                title={t('server-err-title')}
                contentText={t('server-err-desc')}
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
          <EditButton
            showPencilIcon={extpipe.dataSet != null}
            onClick={onEditClick}
            disabled={!canEdit}
            title={t('toggle-edit-row')}
            aria-expanded={isEdit}
            aria-controls="dataSetId"
            data-testid={`${BtnTestIds.EDIT_BTN}dataSetId`}
            $full
          >
            <AddInfo fieldValue={extpipe.dataSet} fieldName="dataSet" />
          </EditButton>
        )}
      </ColumnForm>
    </FormProvider>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-areas: 'hint hint' 'error error' 'input btns';
  grid-template-columns: 1fr auto;
  padding: 0 1rem;
  grid-gap: 0.5rem;
  .input-hint {
    grid-area: hint;
    margin: 0;
  }
  .cogs-select {
    width: 100%;
    grid-area: input;
    height: 2.25rem;
    margin: 0;
  }
  .input-btns {
    grid-area: btns;
  }
  .error-message {
    margin-left: 1rem;
    grid-area: error;
  }
`;
