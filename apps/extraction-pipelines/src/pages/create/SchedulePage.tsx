import React, { FunctionComponent, useEffect, useState } from 'react';
import { Radio } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { createLink } from '@cognite/cdf-utilities';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { ButtonPlaced } from 'styles/StyledButton';
import { GridH2Wrapper } from 'styles/StyledPage';
import { NEXT } from 'utils/constants';
import { CreateFormWrapper, StyledRadioGroup } from 'styles/StyledForm';
import {
  CONTACTS_PAGE_PATH,
  DATA_SET_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import CronInput from 'components/inputs/cron/CronInput';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { mapModelToInput, mapScheduleInputToModel } from 'utils/cronUtils';

import { useAppEnv } from 'hooks/useAppEnv';
import {
  useDetailsUpdate,
  createUpdateSpec,
} from 'hooks/details/useDetailsUpdate';
import { CronWrapper } from 'components/integration/Schedule';
import { scheduleSchema } from 'utils/validation/integrationSchemas';

interface SchedulePageProps {}

export interface ScheduleFormInput {
  schedule: string;
  cron: string;
}

export const INTEGRATION_SCHEDULE_HEADING: Readonly<string> =
  'Integration schedule';

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
        project,
        id: storedIntegration.id,
        fieldName: 'schedule',
        fieldValue: schedule,
      });
      mutate(items, {
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
      });
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
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)} inputWidth={50}>
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
