import React, { FunctionComponent, useEffect, useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { ButtonPlaced } from 'styles/StyledButton';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from '../../routing/RoutingConfig';
import {
  RAW_TABLE_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from '../../routing/CreateRouteConfig';
import { DivFlex } from '../../styles/flex/StyledFlex';
import DataSetIdInput, { DATA_SET_ID_REQUIRED } from './DataSetIdInput';

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
const RadioInputsWrapper = styled.div`
  display: grid;
  input[type='radio'] {
    opacity: 0;
    &:checked {
      + label::after {
        background: ${Colors.primary.hex()};
      }
      + label::before {
        border: 0.125rem solid ${Colors.primary.hex()};
      }
    }
    &:focus {
      + label::before {
        box-shadow: 0 0 0.5rem ${Colors.primary.hex()};
      }
    }
    + label {
      position: relative;
      display: inline-block;
      cursor: pointer;
      margin-left: 1.875rem;
      &:hover {
        &::before {
          border: 0.125rem solid ${Colors.primary.hex()};
        }
      }

      &::before {
        content: '';
        position: absolute;
        display: inline-block;
        left: -1.875rem;
        top: -0.1875rem;
        border-radius: 50%;
        border: 0.125rem solid ${Colors.black.hex()};
        width: 1.5625rem;
        height: 1.5625rem;
        background: transparent;
      }
      &::after {
        content: '';
        position: absolute;
        display: inline-block;
        left: -1.5625rem;
        top: 0.125rem;
        border-radius: 50%;
        width: 0.9375rem;
        height: 0.9375rem;
        background: transparent;
      }
    }
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
export const DATA_SET_REQUIRED: Readonly<string> = 'Data set is required';
const datasetSchema = yup.object().shape({
  dataset: yup.string().required(DATA_SET_REQUIRED),
  datasetId: yup.string().when('dataset', {
    is: (val: DataSetOptions) => val === DataSetOptions.YES,
    then: yup.string().required(DATA_SET_ID_REQUIRED),
  }),
});

interface DataSetPageProps {}

interface DataSetFormInput {
  dataset: string;
  datasetId: string;
}

const DataSetPage: FunctionComponent<DataSetPageProps> = () => {
  const history = useHistory();
  const [showDataSetId, setShowDataSetId] = useState(false);
  const methods = useForm<DataSetFormInput>({
    resolver: yupResolver(datasetSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors, getValues, watch } = methods;
  const datasetValue = watch('dataset');
  useEffect(() => {
    if (datasetValue === DataSetOptions.YES) {
      setShowDataSetId(true);
    } else {
      setShowDataSetId(false);
    }
  }, [datasetValue]);
  const handleNext = () => {
    const value = getValues('dataset');
    switch (value) {
      case DataSetOptions.YES:
      case DataSetOptions.NO: {
        history.push(createLink(RAW_TABLE_PAGE_PATH));
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
  const v = watch('dataset');

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(SCHEDULE_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
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
              <RadioInputsWrapper>
                {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
                <input
                  type="radio"
                  id="yes-option"
                  name="dataset"
                  ref={register}
                  aria-checked={v === DataSetOptions.YES}
                  value={DataSetOptions.YES}
                  aria-controls="data-set-id-wrapper"
                  aria-expanded={showDataSetId}
                />
                <label htmlFor="yes-option">{DataSetOptions.YES}</label>
                {showDataSetId && (
                  <DataSetIdWrapper
                    id="data-set-id-wrapper"
                    role="region"
                    direction="column"
                    align="flex-start"
                  >
                    <DataSetIdInput />
                  </DataSetIdWrapper>
                )}
                <input
                  type="radio"
                  id="no-option"
                  name="dataset"
                  aria-checked={v === DataSetOptions.NO}
                  ref={register}
                  value={DataSetOptions.NO}
                />
                <label htmlFor="no-option">{DataSetOptions.NO}</label>
                <input
                  type="radio"
                  id="create-option"
                  name="dataset"
                  aria-checked={v === DataSetOptions.CREATE}
                  ref={register}
                  value={DataSetOptions.CREATE}
                />
                <label htmlFor="create-option">{CREATE_DATA_SET_LABEL}</label>
              </RadioInputsWrapper>
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
export default DataSetPage;
