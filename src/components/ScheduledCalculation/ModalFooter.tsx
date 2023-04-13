import { Step1Footer } from './Steps/Step1';
import { Step2Footer } from './Steps/Step2';

export const ModalFooter = ({
  currentStep,
  setCurrentStep,
  credsValidated,
  onClose,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  credsValidated: boolean;
  onClose: () => void;
}) => {
  switch (currentStep) {
    case 1:
      return (
        <Step1Footer
          onNext={() => setCurrentStep(currentStep + 1)}
          onCancel={onClose}
          isNextDisabled={!credsValidated}
        />
      );
    case 2:
      return (
        <Step2Footer
          onNext={() => setCurrentStep(currentStep + 1)}
          onCancel={onClose}
        />
      );
    default:
      return null;
  }
};
