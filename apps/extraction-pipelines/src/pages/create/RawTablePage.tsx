import React, { FunctionComponent, useEffect, useState } from 'react';
import { Colors, Radio } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
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
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from 'styles/StyledPage';
import { CreateFormWrapper } from 'styles/StyledForm';
import { SelectedTable } from 'components/inputs/rawSelector/RawSelector';
import { NEXT } from 'utils/constants';
import { ButtonPlaced } from 'styles/StyledButton';

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

interface RawTableFormInput {
  rawTable: string;
  selectedRawTables: SelectedTable[];
}

const RawTablePage: FunctionComponent<RawTablePageProps> = () => {
  const history = useHistory();
  const [showSelector, setSelector] = useState(false);
  const methods = useForm<RawTableFormInput>({
    resolver: yupResolver(rawTableSchema),
    defaultValues: {
      selectedRawTables: [],
    },
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors, watch, setValue } = methods;
  register('rawTable');
  register('selectedRawTables');

  const rawTableValue = watch('rawTable');
  useEffect(() => {
    setSelector(rawTableValue === RawTableOptions.YES);
  }, [rawTableValue]);

  const handleNext = () => {
    history.push(createLink(DOCUMENTATION_PAGE_PATH));
  };
  const v = watch('rawTable');

  const radioChanged = (value: string) => {
    setValue('rawTable', value);
  };
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(DATA_SET_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
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
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};

export default RawTablePage;
