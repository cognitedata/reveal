import { WorkflowStep } from 'modules/types';

export type StepsType = {
  path: string | undefined;
  title: React.ReactNode;
  workflowStep?: WorkflowStep;
  substeps?: StepsType[];
};

export interface StepsProps extends React.HTMLProps<HTMLDivElement> {
  steps: StepsType[];
  current: number;
  small?: boolean;
}

export type StyledStepProps = {
  small?: boolean;
  isCurrent?: boolean;
  wasVisited?: boolean;
};
