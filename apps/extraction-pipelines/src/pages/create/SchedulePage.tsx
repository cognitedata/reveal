import React, { FunctionComponent, useEffect, useState } from 'react';
import { Colors, Radio } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { ButtonPlaced } from 'styles/StyledButton';
import { GridH2Wrapper } from 'styles/StyledPage';
import { NEXT } from 'utils/constants';
import { CreateFormWrapper } from 'styles/StyledForm';
import {
  CONTACTS_PAGE_PATH,
  DATA_SET_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import CronInput from 'components/inputs/cron/CronInput';
import { DivFlex } from 'styles/flex/StyledFlex';
import { CRON_REQUIRED, cronValidator } from 'utils/validation/cronValidation';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { mapModelToInput, mapScheduleInputToModel } from 'utils/cronUtils';
import { createUpdateSpec } from 'utils/contactsUtils';
import { useAppEnv } from 'hooks/useAppEnv';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';

const CronWrapper = styled(DivFlex)`
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

interface SchedulePageProps {}

export interface ScheduleFormInput {
  schedule: string;
  cron: string;
}

export const INTEGRATION_SCHEDULE_HEADING: Readonly<string> =
  'Integration schedule';
const SCHEDULE_REQUIRED: Readonly<string> = 'Schedule is required';
const scheduleSchema = yup.object().shape({
  schedule: yup.string().required(SCHEDULE_REQUIRED),
  cron: yup.string().when('schedule', {
    is: (val: SupportedScheduleStrings) =>
      val === SupportedScheduleStrings.SCHEDULED,
    then: yup
      .string()
      .required(CRON_REQUIRED)
      .test('cron-expression', 'Cron not valid', cronValidator),
  }),
});
const SchedulePage: FunctionComponent<SchedulePageProps> = () => {
  const history = useHistory();
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [showCron, setShowCron] = useState(false);
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();
  const methods = useForm<ScheduleFormInput>({
    resolver: yupResolver(scheduleSchema),
    defaultValues: mapModelToInput(storedIntegration?.schedule),
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors, watch, setError, setValue } = methods;
  useEffect(() => {
    register('schedule');
  }, [register]);
  const scheduleValue = watch('schedule');
  useEffect(() => {
    if (scheduleValue === SupportedScheduleStrings.SCHEDULED) {
      setShowCron(true);
    } else {
      setShowCron(false);
    }
  }, [scheduleValue]);

  const handleNext = (field: ScheduleFormInput) => {
    const schedule = mapScheduleInputToModel(field);
    setStoredIntegration((prev) => {
      return { ...prev, schedule };
    });
    if (storedIntegration?.id && project) {
      const items = createUpdateSpec({
        id: storedIntegration.id,
        fieldName: 'schedule',
        fieldValue: schedule,
      });
      mutate(
        {
          project,
          items,
          id: storedIntegration.id,
        },
        {
          onSuccess: () => {
            history.push(createLink(DATA_SET_PAGE_PATH));
          },
          onError: (serverError) => {
            setError('schedule', {
              type: 'server',
              message: serverError.data.message,
              shouldFocus: true,
            });
          },
        }
      );
    } else {
      setError('schedule', {
        type: 'No id',
        message: 'No id. Select an integration',
        shouldFocus: true,
      });
    }
  };
  const radioChanged = (value: string) => {
    setValue('schedule', value);
  };

  return (
    <RegisterIntegrationLayout backPath={CONTACTS_PAGE_PATH}>
      <GridH2Wrapper>{INTEGRATION_SCHEDULE_HEADING}</GridH2Wrapper>
      <FormProvider {...methods}>
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
            <Radio
              id="scheduled"
              name="schedule"
              value={SupportedScheduleStrings.SCHEDULED}
              checked={SupportedScheduleStrings.SCHEDULED === scheduleValue}
              onChange={radioChanged}
              aria-controls="cron-expression"
              aria-expanded={showCron}
            >
              {SupportedScheduleStrings.SCHEDULED}
            </Radio>
            {showCron && (
              <CronWrapper
                id="cron-expression"
                role="region"
                direction="column"
                align="flex-start"
              >
                <CronInput />
              </CronWrapper>
            )}
            <Radio
              id="continuous"
              name="schedule"
              checked={SupportedScheduleStrings.CONTINUOUS === scheduleValue}
              onChange={radioChanged}
              value={SupportedScheduleStrings.CONTINUOUS}
            >
              {SupportedScheduleStrings.CONTINUOUS}
            </Radio>
            <Radio
              id="on-trigger"
              name="schedule"
              checked={SupportedScheduleStrings.ON_TRIGGER === scheduleValue}
              onChange={radioChanged}
              value={SupportedScheduleStrings.ON_TRIGGER}
            >
              {SupportedScheduleStrings.ON_TRIGGER}
            </Radio>
            <Radio
              id="not-defined"
              name="schedule"
              onChange={radioChanged}
              checked={SupportedScheduleStrings.NOT_DEFINED === scheduleValue}
              value={SupportedScheduleStrings.NOT_DEFINED}
            >
              {SupportedScheduleStrings.NOT_DEFINED}
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
export default SchedulePage;
