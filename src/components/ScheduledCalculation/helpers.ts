import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { captureMessage } from '@sentry/react';
import { UseMutateAsyncFunction } from 'react-query';
import { ComputationStep } from '@cognite/calculation-backend';
import { Chart, ChartWorkflow, ChartWorkflowV2 } from 'models/chart/types';
import { toast } from '@cognite/cogs.js';
import { SetterOrUpdater } from 'recoil';
import { CalculationTaskSchedule } from 'domain/scheduled-calculation/service/types';
import { ScheduleCalculationFieldValues } from '../../domain/scheduled-calculation/internal/types';
import { addScheduledCalculation } from '../../models/chart/updates-calculation';
import { STEPS } from '../../domain/scheduled-calculation/internal/constants';
import { adaptCalculationForClonedScheduledCalculation } from '../../domain/scheduled-calculation/internal/transformers/adaptCalculationForClonedScheduledCalculation';

export const handleNext = ({
  workflow,
  currentStep,
  setStepInfo,
  formMethods,
  createScheduledCalculation,
  workflowSteps,
  setChart,
}: {
  workflow: ChartWorkflow;
  currentStep: number;
  setStepInfo: Dispatch<
    SetStateAction<{
      currentStep: number;
      loading: boolean;
    }>
  >;
  formMethods: UseFormReturn<ScheduleCalculationFieldValues>;
  createScheduledCalculation: UseMutateAsyncFunction<
    CalculationTaskSchedule,
    unknown,
    {
      calculation: ScheduleCalculationFieldValues;
      workflowSteps: ComputationStep[];
    },
    unknown
  >;
  workflowSteps: ComputationStep[];
  setChart: SetterOrUpdater<Chart | undefined>;
}) => {
  switch (currentStep) {
    case STEPS.CREDS_FORM:
      setStepInfo((stepInfo) => ({
        ...stepInfo,
        currentStep: STEPS.SCHEDULE_FORM,
      }));
      break;
    case STEPS.SCHEDULE_FORM:
    case STEPS.RETRY_ERROR_STEP:
      if (!formMethods.formState.isValid) {
        return;
      }
      setStepInfo((stepInfo) => ({
        ...stepInfo,
        loading: true,
      }));
      createScheduledCalculation({
        calculation: formMethods.watch(),
        workflowSteps,
      })
        .catch((error) => {
          toast.error(JSON.stringify(error, null, 2), {
            toastId: 'scheduled-calculation-creation-error',
          });
          setStepInfo({
            loading: false,
            currentStep: STEPS.RETRY_ERROR_STEP,
          });
          return undefined;
        })
        .then((scheduledCalculation) => {
          if (scheduledCalculation) {
            setChart((oldChart) =>
              addScheduledCalculation(
                oldChart!,
                adaptCalculationForClonedScheduledCalculation(
                  workflow as ChartWorkflowV2,
                  oldChart!.id,
                  scheduledCalculation.externalId
                )
              )
            );
            setStepInfo({ loading: false, currentStep: STEPS.SUCCESS });
          }
        });

      break;
    default:
      captureMessage(`ScheduledCalculationForm: Invalid step - ${currentStep}`);
  }
};
