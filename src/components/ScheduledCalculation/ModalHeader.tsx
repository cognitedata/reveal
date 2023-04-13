import { Step1Header } from './Steps/Step1';
import { Step2Header } from './Steps/Step2';

export const ModalHeader = ({ currentStep }: { currentStep: number }) => {
  switch (currentStep) {
    case 1:
      return <Step1Header />;
    case 2:
      return <Step2Header />;
    default:
      return null;
  }
};
