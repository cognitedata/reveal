import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { StyledModal } from './elements';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const STEP_WIDTH: Record<number, number> = {
  1: 620,
  2: 908,
};

const DEFAULT_VALUES = {
  clientId: '',
  clientSecret: '',
  useCdfCredentials: true,
  period: 1,
  periodType: { value: 'hour', label: 'Hour' },
  unit: { value: 'percentage', label: '%' },
};

export const ScheduledCalculationModal = ({ visible, onClose }: Props) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [credsValidated, setCredsValidated] = useState<boolean>(false);
  const formMethods = useForm({ mode: 'all', defaultValues: DEFAULT_VALUES });

  return (
    <StyledModal
      visible={visible}
      onCancel={onClose}
      title={<ModalHeader currentStep={currentStep} />}
      footer={
        <ModalFooter
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          credsValidated={credsValidated}
          onClose={onClose}
        />
      }
      width={STEP_WIDTH[currentStep]}
    >
      <FormProvider {...formMethods}>
        <ModalBody
          currentStep={currentStep}
          onUpdateCredsValidated={setCredsValidated}
        />
      </FormProvider>
    </StyledModal>
  );
};
