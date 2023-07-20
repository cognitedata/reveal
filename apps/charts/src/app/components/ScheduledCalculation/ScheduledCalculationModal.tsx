import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { getStepsFromWorkflow } from '@charts-app/components/NodeEditor/transforms';
import { useScheduledCalculationCreateMutate } from '@charts-app/domain/scheduled-calculation/service/queries/useScheduledCalculationCreateMutate';
import { useTranslations } from '@charts-app/hooks/translations';
import { useChartAtom } from '@charts-app/models/chart/atom';
import { useOperations } from '@charts-app/models/operations/atom';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { ModalDefaultProps, Modal, IconType } from '@cognite/cogs.js';

import { useGetWorkflow } from '../../domain/chart/internal/queries/useGetWorkflow';
import {
  DEFAULT_STEP_INFO,
  DEFAULT_VALUES,
} from '../../domain/scheduled-calculation/internal/constants';
import {
  ScheduleCalculationFieldValues,
  ScheduledCalculationModalProps,
  StepInfo,
} from '../../domain/scheduled-calculation/internal/types';

import { handleNext } from './helpers';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';

type Header = {
  icon: IconType;
  title: keyof typeof defaultTranslations;
} | null;

const defaultTranslations = makeDefaultTranslations(
  'Create scheduled calculation',
  'Save result and schedule the calculation',
  'Error occured',
  'Cancel',
  'Next'
);

const STEP_WIDTH: Record<string, ModalDefaultProps['size']> = {
  1: 'small',
  2: 'large',
  3: 'medium',
  4: 'medium',
};

const STEP_HEADER: Record<string, Header> = {
  1: {
    icon: 'Clock',
    title: 'Create scheduled calculation',
  },
  2: {
    icon: 'Clock',
    title: 'Save result and schedule the calculation',
  },
  3: {
    icon: 'WarningFilled',
    title: 'Error occured',
  },
};

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
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  const [credsValidated, setCredsValidated] = useState<boolean>(false);

  const formMethods = useForm<ScheduleCalculationFieldValues>({
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });

  const modalHeader = STEP_HEADER[currentStep];
  const title = modalHeader ? t[modalHeader.title] : '';

  return (
    <Modal
      visible
      onCancel={onClose}
      hideFooter
      icon={modalHeader?.icon}
      title={title}
      size={STEP_WIDTH[currentStep]}
    >
      <FormProvider {...formMethods}>
        <ModalBody
          currentStep={currentStep}
          onUpdateCredsValidated={setCredsValidated}
          onClose={onClose}
          workflowId={workflowId}
        />
      </FormProvider>
      <div style={{ paddingTop: '16px' }}>
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
      </div>
    </Modal>
  );
};
