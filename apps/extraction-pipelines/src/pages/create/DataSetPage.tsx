import React, { FunctionComponent, useEffect, useState } from 'react';
import { Colors, Radio } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { ButtonPlaced } from 'styles/StyledButton';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { GridH2Wrapper } from 'styles/StyledPage';
import { NEXT } from 'utils/constants';
import { CreateFormWrapper, StyledLabel } from 'styles/StyledForm';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from 'routing/RoutingConfig';
import {
  RAW_TABLE_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import { DivFlex } from 'styles/flex/StyledFlex';
import DataSetIdInput, {
  DATASET_LIST_LIMIT,
} from 'pages/create/DataSetIdInput';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { getDataSetPageValues } from 'utils/dataSetUtils';
import { useDataSetsList } from 'hooks/useDataSetsList';
import {
  useDetailsUpdate,
  createUpdateSpec,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { datasetSchema } from 'utils/validation/integrationSchemas';

const DataSetIdWrapper = styled(DivFlex)`
  margin: 1rem 2rem;
  padding: 1rem 0 0 0;
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;
const StyledRadioGroup = styled.fieldset`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  legend {
    font-weight: bold;
    font-size: initial;
    margin-bottom: 0;
  }
`;

export enum DataSetOptions {
  YES = 'Yes',
  NO = 'No',
  CREATE = 'Create',
}
export const CREATE_DATA_SET_LABEL: Readonly<string> =
  'No, I want to creat a data set now';
export const INTEGRATION_DATA_SET_HEADING: Readonly<string> =
  'Integration data set';
export const DATA_SET_TIP: Readonly<string> =
  'The data your integration sends to CDF can be linked to a data set.';

interface DataSetPageProps {}

export interface DataSetFormInput {
  dataset: string;
  dataSetId: string;
}

const DataSetPage: FunctionComponent<DataSetPageProps> = () => {
  const history = useHistory();
  const [showDataSetId, setShowDataSetId] = useState(false);
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const { data, status } = useDataSetsList(DATASET_LIST_LIMIT);
  const methods = useForm<DataSetFormInput>({
    resolver: yupResolver(datasetSchema),
    defaultValues: getDataSetPageValues(
      `${storedIntegration?.dataSetId}`,
      data
    ),
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors, watch, setValue, setError } = methods;
  register('dataset');
  register('dataSetId');
  const datasetValue = watch('dataset');
  useEffect(() => {
    setShowDataSetId(datasetValue === DataSetOptions.YES);
  }, [datasetValue]);

  const handleNext = (fields: DataSetFormInput) => {
    const valueToStore =
      fields.dataset === DataSetOptions.YES
        ? parseInt(fields.dataSetId, 10)
        : undefined;
    setStoredIntegration((prev) => ({
      ...prev,
      dataSetId: valueToStore,
    }));
    switch (fields.dataset) {
      case DataSetOptions.YES:
      case DataSetOptions.NO: {
        if (storedIntegration?.id && project) {
          const items = createUpdateSpec({
            project,
            id: storedIntegration.id,
            fieldName: 'dataSetId',
            fieldValue: valueToStore,
          });
          mutate(items, {
            onSuccess: () => {
              history.push(createLink(RAW_TABLE_PAGE_PATH));
            },
            onError: (serverError) => {
              setError('dataSetId', {
                type: 'server',
                message: serverError.data.message,
                shouldFocus: true,
              });
            },
          });
        } else {
          setError('dataSetId', {
            type: 'No id',
            message: 'No id. Select an integration',
            shouldFocus: true,
          });
        }
        break;
      }
      case DataSetOptions.CREATE: {
        break;
      }
      default: {
        history.push(createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH));
        break;
      }
    }
  };
  const radioChanged = (value: string) => {
    setValue('dataset', value);
  };

  return (
    <RegisterIntegrationLayout backPath={SCHEDULE_PAGE_PATH}>
      <GridH2Wrapper>{INTEGRATION_DATA_SET_HEADING}</GridH2Wrapper>
      <FormProvider {...methods}>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <StyledRadioGroup>
            <legend>Does the integration write to a data set?</legend>
            <span id="data-set-hint" className="input-hint">
              {DATA_SET_TIP}
            </span>
            <ErrorMessage
              errors={errors}
              name="dataset"
              render={({ message }) => (
                <span id="data-set-error" className="error-message">
                  {message}
                </span>
              )}
            />
            <Radio
              id="yes-option"
              name="dataset"
              value={DataSetOptions.YES}
              checked={datasetValue === DataSetOptions.YES}
              onChange={radioChanged}
              aria-checked={datasetValue === DataSetOptions.YES}
              aria-controls="data-set-id-wrapper"
              aria-expanded={showDataSetId}
            >
              {DataSetOptions.YES}
            </Radio>
            {showDataSetId && (
              <DataSetIdWrapper
                id="data-set-id-wrapper"
                role="region"
                direction="column"
                align="flex-start"
              >
                <DataSetIdInput
                  data={data}
                  status={status}
                  renderLabel={(labelText, inputId) => (
                    <StyledLabel id="data-set-id-label" htmlFor={inputId}>
                      {labelText}
                    </StyledLabel>
                  )}
                />
              </DataSetIdWrapper>
            )}
            <Radio
              id="no-option"
              name="dataset"
              value={DataSetOptions.NO}
              checked={datasetValue === DataSetOptions.NO}
              onChange={radioChanged}
              aria-checked={datasetValue === DataSetOptions.NO}
            >
              {DataSetOptions.NO}
            </Radio>
            <Radio
              id="create-option"
              name="dataset"
              value={DataSetOptions.CREATE}
              checked={datasetValue === DataSetOptions.CREATE}
              onChange={radioChanged}
              aria-checked={datasetValue === DataSetOptions.CREATE}
            >
              {CREATE_DATA_SET_LABEL}
            </Radio>
          </StyledRadioGroup>
          <ButtonPlaced type="primary" htmlType="submit">
            {NEXT}
          </ButtonPlaced>
        </CreateFormWrapper>
      </FormProvider>
    </RegisterIntegrationLayout>
  );
};
export default DataSetPage;
