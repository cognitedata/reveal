import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import {
  DATA_SET_PAGE_PATH,
  INTEGRATIONS_OVERVIEW_PAGE_PATH,
  METADATA_PAGE_PATH,
  RAW_TABLE_LIST_PAGE_PATH,
} from '../../routing/RoutingConfig';

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
});

interface RawTablePageProps {}

interface RawTableFormInput {
  rawTable: string;
}

const RawTablePage: FunctionComponent<RawTablePageProps> = () => {
  const history = useHistory();
  const {
    register,
    handleSubmit,
    errors,
    getValues,
    watch,
  } = useForm<RawTableFormInput>({
    resolver: yupResolver(rawTableSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    const value = getValues('rawTable');
    switch (value) {
      case RawTableOptions.YES: {
        history.push(createLink(RAW_TABLE_LIST_PAGE_PATH));
        break;
      }
      case RawTableOptions.NO: {
        history.push(createLink(METADATA_PAGE_PATH));
        break;
      }
      default: {
        history.push(createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH));
        break;
      }
    }
  };
  const v = watch('rawTable');

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(DATA_SET_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_RAW_TABLE_HEADING}</GridH2Wrapper>
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
            <RadioInputsWrapper>
              <input
                type="radio"
                id="yes-option"
                name="rawTable"
                ref={register}
                aria-checked={v === RawTableOptions.YES}
                value={RawTableOptions.YES}
              />
              <label htmlFor="yes-option">{RawTableOptions.YES}</label>
              <input
                type="radio"
                id="no-option"
                name="rawTable"
                aria-checked={v === RawTableOptions.NO}
                ref={register}
                value={RawTableOptions.NO}
              />
              <label htmlFor="no-option">{RawTableOptions.NO}</label>
            </RadioInputsWrapper>
          </StyledRadioGroup>
          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default RawTablePage;
