import { Step1Header } from './Steps/Step1';
import { Step2Header } from './Steps/Step2';
import { Step3Header } from './Steps/Step3';

export const ModalHeader = ({ currentStep }: { currentStep: number }) => {
  switch (currentStep) {
    case 1:
      return <Step1Header />;
    case 2:
      return <Step2Header />;
    case 3:
      return <Step3Header />;
    case 4:
    default:
      return null;
  }
};
