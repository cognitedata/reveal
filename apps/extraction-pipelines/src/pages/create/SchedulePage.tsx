import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { INTEGRATIONS } from '../../utils/baseURL';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';

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
interface SchedulePageProps {}

interface ScheduleFormInput {
  schedule: string;
}

export const INTEGRATION_SCHEDULE_HEADING: Readonly<string> =
  'Integration schedule';
const SCHEDULE_REQUIRED: Readonly<string> = 'Schedule is required';
const scheduleSchema = yup.object().shape({
  schedule: yup.string().required(SCHEDULE_REQUIRED),
});
const SchedulePage: FunctionComponent<SchedulePageProps> = () => {
  const history = useHistory();
  const {
    register,
    handleSubmit,
    errors,
    getValues,
    watch,
  } = useForm<ScheduleFormInput>({
    resolver: yupResolver(scheduleSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    const value = getValues('schedule');
    switch (value) {
      case SupportedScheduleStrings.NOT_DEFINED:
      case SupportedScheduleStrings.ON_TRIGGER:
      case SupportedScheduleStrings.CONTINUOUS: {
        history.push(
          createLink(`/${INTEGRATIONS}/create/integration-data-set`)
        );
        break;
      }
      case SupportedScheduleStrings.SCHEDULED: {
        history.push(createLink(`/${INTEGRATIONS}/create/integration-cron`));
        break;
      }
      default: {
        history.push(createLink(`/${INTEGRATIONS}`));
        break;
      }
    }
  };
  const v = watch('schedule');
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper
        to={createLink(`/${INTEGRATIONS}/create/integration-description`)}
      >
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_SCHEDULE_HEADING}</GridH2Wrapper>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <StyledRadioGroup>
            <legend>Schedule</legend>
            <span id="schedule-hint" className="input-hint">
              Select whether your integration runs according to a defined
              schedule, is triggered by some irregular automatic or manual
              event, or pushes data continuously, such as streaming or
              continuous polling for new data.
            </span>
            <ErrorMessage
              errors={errors}
              name="schedule"
              render={({ message }) => (
                <span id="schedule-error" className="error-message">
                  {message}
                </span>
              )}
            />
            <RadioInputsWrapper>
              <input
                type="radio"
                id="not-defined"
                name="schedule"
                ref={register}
                aria-checked={SupportedScheduleStrings.NOT_DEFINED === v}
                value={SupportedScheduleStrings.NOT_DEFINED}
              />
              <label htmlFor="not-defined">
                {SupportedScheduleStrings.NOT_DEFINED}
              </label>
              <input
                type="radio"
                id="on-trigger"
                name="schedule"
                aria-checked={SupportedScheduleStrings.ON_TRIGGER === v}
                ref={register}
                value={SupportedScheduleStrings.ON_TRIGGER}
              />
              <label htmlFor="on-trigger">
                {SupportedScheduleStrings.ON_TRIGGER}
              </label>
              <input
                type="radio"
                id="continuous"
                name="schedule"
                aria-checked={SupportedScheduleStrings.CONTINUOUS === v}
                ref={register}
                value={SupportedScheduleStrings.CONTINUOUS}
              />
              <label htmlFor="continuous">
                {SupportedScheduleStrings.CONTINUOUS}
              </label>
              <input
                type="radio"
                id="scheduled"
                name="schedule"
                aria-checked={SupportedScheduleStrings.SCHEDULED === v}
                ref={register}
                value={SupportedScheduleStrings.SCHEDULED}
              />
              <label htmlFor="scheduled">
                {SupportedScheduleStrings.SCHEDULED}
              </label>
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
export default SchedulePage;
