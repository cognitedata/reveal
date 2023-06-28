import { Step1Body } from './Steps/Step1';
import { Step2Body } from './Steps/Step2';
import { Step3Body } from './Steps/Step3';
import { Step4Body } from './Steps/Step4';

export const ModalBody = ({
  currentStep,
  onUpdateCredsValidated,
  onClose,
  workflowId,
}: {
  currentStep: number;
  onUpdateCredsValidated: (validated: boolean) => void;
  onClose: () => void;
  workflowId: string;
}) => {
  switch (currentStep) {
    case 1:
      return <Step1Body onUpdateCredsValidated={onUpdateCredsValidated} />;
    case 2:
      return <Step2Body workflowId={workflowId} />;
    case 3:
      return <Step3Body />;
    case 4:
      return <Step4Body onClose={onClose} />;
    default:
      return null;
  }
};
