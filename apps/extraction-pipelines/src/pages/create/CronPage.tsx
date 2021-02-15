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
  SCHEDULE_PAGE_PATH,
} from '../../routing/RoutingConfig';

const StyledInput = styled.input`
  width: 50%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;
export const CRON_LABEL: Readonly<string> = 'Cron expression';
export const INTEGRATION_CRON_HEADING: Readonly<string> =
  'Integration schedule - Cron Expression';
export const CRON_TIP: Readonly<string> =
  'Enter a cron expression for when the integration is scheduled to run.';
export const CRON_REQUIRED: Readonly<string> = 'Cron is required';
const cronSchema = yup.object().shape({
  cron: yup.string(),
});

interface CronPageProps {}

interface CronFormInput {
  cron: string;
}

const CronPage: FunctionComponent<CronPageProps> = () => {
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<CronFormInput>({
    resolver: yupResolver(cronSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    history.push(createLink(DATA_SET_PAGE_PATH));
  };

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(SCHEDULE_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_CRON_HEADING}</GridH2Wrapper>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <label htmlFor="cron-input" className="input-label">
            {CRON_LABEL}
          </label>
          <span id="cron-hint" className="input-hint">
            {CRON_TIP}
          </span>
          <ErrorMessage
            errors={errors}
            name="cron"
            render={({ message }) => (
              <span id="cron-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="cron-input"
            name="cron"
            type="text"
            ref={register}
            className={`cogs-input ${errors.cron ? 'has-error' : ''}`}
            aria-invalid={!!errors.cron}
            aria-describedby="cron-hint cron-error"
          />
          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default CronPage;
