import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useScheduledCalculationCreateMutate } from 'domain/scheduled-calculation/service/queries/useScheduledCalculationCreateMutate';
import { useChartAtom } from 'models/chart/atom';
import { useOperations } from 'models/operations/atom';
import { getStepsFromWorkflow } from 'components/NodeEditor/transforms';
import { StyledModal } from './elements';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import {
  ScheduleCalculationFieldValues,
  ScheduledCalculationModalProps,
  StepInfo,
} from '../../domain/scheduled-calculation/internal/types';
import { useGetWorkflow } from '../../domain/chart/internal/queries/useGetWorkflow';
import {
  DEFAULT_STEP_INFO,
  STEP_WIDTH,
  DEFAULT_VALUES,
} from '../../domain/scheduled-calculation/internal/constants';
import { handleNext } from './helpers';

export const ScheduledCalculationModal = ({
  onClose,
  workflowId,
}: ScheduledCalculationModalProps) => {
  const [stepInfo, setStepInfo] = useState<StepInfo>(DEFAULT_STEP_INFO);
  const { loading, currentStep } = stepInfo;
  const { mutateAsync: createScheduledCalculation } =
    useScheduledCalculationCreateMutate();
  const [chart, setChart] = useChartAtom();
  const [, , operations] = useOperations();
  const workflow = useGetWorkflow(workflowId);
  const workflowSteps = getStepsFromWorkflow(chart!, workflow!, operations);

  const [credsValidated, setCredsValidated] = useState<boolean>(false);

  const formMethods = useForm<ScheduleCalculationFieldValues>({
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });

  return (
    <StyledModal
      visible
      onCancel={onClose}
      title={<ModalHeader currentStep={currentStep} />}
      footer={
        <ModalFooter
          currentStep={currentStep}
          credsValidated={credsValidated}
          onClose={onClose}
          onNext={() =>
            handleNext({
              workflow: workflow!,
              formMethods,
              setStepInfo,
              currentStep,
              createScheduledCalculation,
              workflowSteps,
              setChart,
            })
          }
          loading={loading}
        />
      }
      width={STEP_WIDTH[currentStep]}
    >
      <FormProvider {...formMethods}>
        <ModalBody
          currentStep={currentStep}
          onUpdateCredsValidated={setCredsValidated}
          onClose={onClose}
          workflowId={workflowId}
        />
      </FormProvider>
    </StyledModal>
  );
};
