import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import Step from './Step';
import { StepsProps, StepsType } from './types';

Steps.Step = Step;

/**
 * The Steps component
 */
const StyledSteps = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-width: 260px;
  font-family: 'Inter';
  font-weight: 600;
  margin-right: 24px;
  color: ${Colors['greyscale-grey6'].hex()};
`;

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
        substeps={step.substeps}
      />
    );
  });
  return <StyledSteps>{mapChildren}</StyledSteps>;
}
