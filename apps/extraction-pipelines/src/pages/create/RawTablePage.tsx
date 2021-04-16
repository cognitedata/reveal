import React, { FunctionComponent, useEffect, useState } from 'react';
import { Colors, Radio } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { DivFlex } from 'styles/flex/StyledFlex';
import ConnectRawTablesInput, {
  TABLE_REQUIRED,
} from 'components/inputs/rawSelector/ConnectRawTablesInput';
import {
  DATA_SET_PAGE_PATH,
  DOCUMENTATION_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import { GridH2Wrapper } from 'styles/StyledPage';
import { CreateFormWrapper } from 'styles/StyledForm';
import { NEXT } from 'utils/constants';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { ButtonPlaced } from 'styles/StyledButton';
import { IntegrationRawTable } from 'model/Integration';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { mapStoredToDefault } from 'utils/raw/rawUtils';

import { useAppEnv } from 'hooks/useAppEnv';
import {
  useDetailsUpdate,
  createUpdateSpec,
} from 'hooks/details/useDetailsUpdate';

const ConditionalWrapper = styled(DivFlex)`
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
export enum RawTableOptions {
  YES = 'Yes',
  NO = 'No',
}
export const RAW_TABLE_LABEL: Readonly<string> =
  'Does your integration write to one or more Raw Tables?';
export const INTEGRATION_RAW_TABLE_HEADING: Readonly<string> =
  'Integration Raw Tables';
export const RAW_TABLE_TIP: Readonly<string> = '***Put some hint here***';
export const RAW_TABLE_REQUIRED: Readonly<string> = 'Raw table is required';
const rawTableSchema = yup.object().shape({
  rawTable: yup.string().required(RAW_TABLE_REQUIRED),
  selectedRawTables: yup
    .array()
    .of(
      yup.object().shape({
        databaseName: yup.string(),
        tableName: yup.string(),
      })
    )
    .when('rawTable', {
      is: (val: RawTableOptions) => val === RawTableOptions.YES,
      then: yup.array().min(1, TABLE_REQUIRED),
    }),
});

interface RawTablePageProps {}

export interface RawTableFormInput {
  rawTable: RawTableOptions | '';
  selectedRawTables: IntegrationRawTable[];
}

const RawTablePage: FunctionComponent<RawTablePageProps> = () => {
  const history = useHistory();
  const [showSelector, setSelector] = useState(false);
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();

  const methods = useForm<RawTableFormInput>({
    resolver: yupResolver(rawTableSchema),
    defaultValues: mapStoredToDefault(storedIntegration?.rawTables),
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors, watch, setValue, setError } = methods;
  register('rawTable');
  register('selectedRawTables');

  const rawTableValue = watch('rawTable');
  useEffect(() => {
    setSelector(rawTableValue === RawTableOptions.YES);
  }, [rawTableValue]);

  const handleNext = (field: RawTableFormInput) => {
    const selected =
      field.rawTable === RawTableOptions.YES ? field.selectedRawTables : [];
    setStoredIntegration((prev) => {
      return { ...prev, rawTables: selected };
    });

    if (storedIntegration?.id && project) {
      const items = createUpdateSpec({
        project,
        id: storedIntegration.id,
        fieldName: 'rawTables',
        fieldValue: selected,
      });
      mutate(items, {
        onSuccess: () => {
          history.push(createLink(DOCUMENTATION_PAGE_PATH));
        },
        onError: (serverError) => {
          setError('rawTables', {
            type: 'server',
            message: serverError.data.message,
            shouldFocus: true,
          });
        },
      });
    } else {
      setError('datasetId', {
        type: 'No id',
        message: 'No id. Select an integration',
        shouldFocus: true,
      });
    }
  };
  const v = watch('rawTable');

  const radioChanged = (value: string) => {
    setValue('rawTable', value);
  };
  return (
    <RegisterIntegrationLayout backPath={DATA_SET_PAGE_PATH}>
      <GridH2Wrapper>{INTEGRATION_RAW_TABLE_HEADING}</GridH2Wrapper>
      <FormProvider {...methods}>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <StyledRadioGroup>
            <legend>{RAW_TABLE_LABEL}</legend>
            <span id="raw-table-hint" className="input-hint">
              {RAW_TABLE_TIP}
            </span>
            <ErrorMessage
              errors={errors}
              name="rawTable"
              render={({ message }) => (
                <span id="raw-table-error" className="error-message">
                  {message}
                </span>
              )}
            />
            <Radio
              id="yes-option"
              name="rawTable"
              value={RawTableOptions.YES}
              checked={v === RawTableOptions.YES}
              onChange={radioChanged}
              aria-checked={v === RawTableOptions.YES}
              aria-controls="raw-table-wrapper"
              aria-expanded={showSelector}
            >
              {RawTableOptions.YES}
            </Radio>
            {showSelector && (
              <ConditionalWrapper
                id="raw-table-wrapper"
                role="region"
                direction="column"
                align="flex-start"
              >
                <ConnectRawTablesInput />
              </ConditionalWrapper>
            )}
            <Radio
              id="no-option"
              name="rawTable"
              value={RawTableOptions.NO}
              checked={v === RawTableOptions.NO}
              onChange={radioChanged}
              aria-checked={v === RawTableOptions.NO}
              aria-controls="raw-table-wrapper"
              aria-expanded={showSelector}
            >
              {RawTableOptions.NO}
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

export default RawTablePage;
