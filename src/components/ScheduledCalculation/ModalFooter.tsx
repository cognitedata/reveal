import { Step1Footer } from './Steps/Step1';
import { Step2Footer } from './Steps/Step2';
import { Step3Footer } from './Steps/Step3';

export const ModalFooter = ({
  currentStep,
  credsValidated,
  onClose,
  onNext,
  loading,
}: {
  currentStep: number;
  credsValidated: boolean;
  loading: boolean;
  onClose: () => void;
  onNext: () => void;
}) => {
  switch (currentStep) {
    case 1:
      return (
        <Step1Footer
          onNext={onNext}
          onCancel={onClose}
          isNextDisabled={!credsValidated}
        />
      );
    case 2:
      return (
        <Step2Footer onNext={onNext} onCancel={onClose} loading={loading} />
      );
    case 3:
      return (
        <Step3Footer onNext={onNext} onCancel={onClose} loading={loading} />
      );
    case 4:
    default:
      return null;
  }
};
