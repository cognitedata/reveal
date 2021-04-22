import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { WorkflowStep } from 'modules/workflows';
import Step from './Step';

Steps.Step = Step;

/**
 * The Steps component
 */
const StyledSteps = styled.div`
  display: flex;
  flex-direction: row;
  font-family: 'Inter';
  font-weight: 600;
  color: ${Colors['greyscale-grey6'].hex()};
`;

export type StepsType = {
  path: string | undefined;
  title: string | React.ReactNode;
  workflowStep?: WorkflowStep;
};

interface StepsProps extends React.HTMLProps<HTMLDivElement> {
  steps: StepsType[];
  current: number;
  small?: boolean;
}

export function Steps(props: StepsProps) {
  const { steps, current, small } = props;
  const mapChildren = steps.map((step: StepsType, index: number) => {
    return (
      <Step
        key={`step-${step.path ? step.path : index}`}
        stepIndex={index}
        currentStepIndex={current}
        url={step.path ?? ''}
        title={step.title}
        small={small}
        workflowStep={step.workflowStep}
      />
    );
  });
  return <StyledSteps>{mapChildren}</StyledSteps>;
}
