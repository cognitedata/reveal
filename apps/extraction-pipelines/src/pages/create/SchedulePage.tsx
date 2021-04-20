import React, { FunctionComponent, useEffect, useState } from 'react';
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
import { CreateFormWrapper, Hint } from 'styles/StyledForm';
import {
  CONTACTS_PAGE_PATH,
  DATA_SET_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import CronInput from 'components/inputs/cron/CronInput';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import {
  mapModelToInput,
  mapScheduleInputToScheduleValue,
} from 'utils/cronUtils';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  useDetailsUpdate,
  createUpdateSpec,
} from 'hooks/details/useDetailsUpdate';
import { CronWrapper } from 'components/integration/Schedule';
import { scheduleSchema } from 'utils/validation/integrationSchemas';
import { ScheduleSelector } from 'components/inputs/ScheduleSelector';
import { OptionTypeBase } from 'react-select';

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
    const schedule = mapScheduleInputToScheduleValue(field);
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
  const selectChanged = (selected: OptionTypeBase) => {
    setValue('schedule', selected.value);
  };

  return (
    <RegisterIntegrationLayout backPath={CONTACTS_PAGE_PATH}>
      <GridH2Wrapper>{INTEGRATION_SCHEDULE_HEADING}</GridH2Wrapper>
      <FormProvider {...methods}>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)} inputWidth={50}>
          <label htmlFor="schedule-selector" className="input-label">
            Schedule
          </label>
          <Hint id="schedule-hint" className="input-hint">
            Select whether your integration runs according to a defined
            schedule, is triggered by some irregular automatic or manual event,
            or pushes data continuously, such as streaming or continuous polling
            for new data.
          </Hint>
          <ErrorMessage
            errors={errors}
            name="schedule"
            render={({ message }) => (
              <span id="schedule-error" className="error-message">
                {message}
              </span>
            )}
          />
          <ScheduleSelector
            inputId="schedule-selector"
            schedule={scheduleValue}
            onSelectChange={selectChanged}
          />
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
          <ButtonPlaced type="primary" htmlType="submit">
            {NEXT}
          </ButtonPlaced>
        </CreateFormWrapper>
      </FormProvider>
    </RegisterIntegrationLayout>
  );
};
export default SchedulePage;
