import { Step1Body } from './Steps/Step1';
import { Step2Body } from './Steps/Step2';

export const ModalBody = ({
  currentStep,
  onUpdateCredsValidated,
}: {
  currentStep: number;
  onUpdateCredsValidated: (validated: boolean) => void;
}) => {
  switch (currentStep) {
    case 1:
      return <Step1Body onUpdateCredsValidated={onUpdateCredsValidated} />;
    case 2:
      return <Step2Body />;
    default:
      return null;
  }
};
