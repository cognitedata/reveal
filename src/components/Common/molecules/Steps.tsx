// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { Link } from 'components/Common';

Steps.Step = Step;
export type StepsType = {
  path: string | undefined;
  breadcrumbs: string[];
};

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

interface StepsProps extends React.HTMLProps<HTMLDivElement> {
  steps: StepsType[];
  current: number;
  small?: boolean;
}

export function Steps(props: StepsProps) {
  const { steps, current, small } = props;
  const mapChildren = steps.map((step: StepsProps, index: number) => {
    return (
      <Step
        key={`step-${step.path ? step.path : index}`}
        stepIndex={index}
        currentStepIndex={current}
        url={step.path}
        title={step.breadcrumbs.join('')}
        small={small}
      />
    );
  });
  return <StyledSteps>{mapChildren}</StyledSteps>;
}

/**
 * A single step
 */
const StyledStep = styled.div<{ small: boolean; current: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: ${(props) => (props.small ? '12px' : '16px')};
  color: ${(props) =>
    props.current
      ? Colors['greyscale-grey9'].hex()
      : Colors['greyscale-grey6'].hex()};
  & > * {
    margin: 0 4px;
  }
  &:first-child > :first-child {
    margin-left: 4px;
  }
  &:not(:last-child)::after {
    margin: 6px 6px;
    content: '—';
  }
  a {
    color: ${Colors['greyscale-grey6'].hex()};
  }
`;
const StepNumber = styled.span<{ small: boolean; current: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: ${(props) => (props.small ? '24px' : '32px')};
  min-height: ${(props) => (props.small ? '24px' : '32px')};
  padding: 2px;
  border-radius: 20px;
  box-sizing: border-box;
  user-select: none;
  color: ${(props) =>
    props.current
      ? Colors['greyscale-grey9'].hex()
      : Colors['greyscale-grey6'].hex()};
  border: 2px solid
    ${(props) =>
      props.current
        ? Colors['greyscale-grey9'].hex()
        : Colors['greyscale-grey6'].hex()};
`;
type StepProps = {
  title: string | React.ReactNode;
  url: string;
  stepIndex: number;
  currentStepIndex: number;
  small?: boolean;
};
function Step(props: StepProps) {
  const { title, url, stepIndex, currentStepIndex, small } = props;
  const isPreviousStep: boolean = stepIndex < currentStepIndex;
  const isCurrent: boolean = stepIndex === currentStepIndex;

  return (
    <StyledStep small={!!small} current={isCurrent}>
      <StepNumber small={!!small} current={isCurrent}>
        {stepIndex + 1}
      </StepNumber>
      {isPreviousStep ? <Link to={url}>{title}</Link> : <div>{title}</div>}
    </StyledStep>
  );
}
