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
  RAW_TABLE_PAGE_PATH,
} from '../../routing/RoutingConfig';

const StyledInput = styled.input`
  width: 50%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;
export const DATA_SET_ID_LABEL: Readonly<string> = 'Data set id';
export const INTEGRATION_DATA_SET_ID_HEADING: Readonly<string> =
  'Integration Data Set Id';
export const DATA_SET_ID_TIP: Readonly<string> =
  'Type in the id of your data set';
export const DATA_SET_ID_REQUIRED: Readonly<string> = 'Data set id is required';
const dataSetIdSchema = yup.object().shape({
  dataSetId: yup.string(),
});

interface DataSetIdPageProps {}

interface DataSetIdFormInput {
  dataSetId: string;
}

const DataSetIdPage: FunctionComponent<DataSetIdPageProps> = () => {
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<DataSetIdFormInput>({
    resolver: yupResolver(dataSetIdSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    history.push(createLink(RAW_TABLE_PAGE_PATH));
  };

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(DATA_SET_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_DATA_SET_ID_HEADING}</GridH2Wrapper>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <label htmlFor="data-set-id-input" className="input-label">
            {DATA_SET_ID_LABEL}
          </label>
          <span id="data-set-id-hint" className="input-hint">
            {DATA_SET_ID_TIP}
          </span>
          <ErrorMessage
            errors={errors}
            name="dataSetId"
            render={({ message }) => (
              <span id="data-set-id-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="data-set-id-input"
            name="dataSetId"
            type="text"
            ref={register}
            className={`cogs-input ${errors.dataSetId ? 'has-error' : ''}`}
            aria-invalid={!!errors.dataSetId}
            aria-describedby="data-set-id-hint data-set-id-error"
          />
          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default DataSetIdPage;
