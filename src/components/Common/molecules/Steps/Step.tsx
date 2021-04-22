import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { moveToStep, WorkflowStep } from 'modules/workflows';
import { Link } from 'components/Common';

const StyledStep = styled.div<{ small: boolean; current: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
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
  workflowStep?: WorkflowStep;
};

export default function Step(props: StepProps) {
  const {
    title,
    url,
    stepIndex,
    currentStepIndex,
    small,
    workflowStep,
  } = props;
  const dispatch = useDispatch();
  const isPreviousStep: boolean = stepIndex < currentStepIndex;
  const isCurrent: boolean = stepIndex === currentStepIndex;

  const onLinkClick = () => {
    if (workflowStep) {
      dispatch(moveToStep(workflowStep));
    }
  };

  return (
    <StyledStep small={!!small} current={isCurrent}>
      <StepNumber small={!!small} current={isCurrent}>
        {stepIndex + 1}
      </StepNumber>
      {isPreviousStep ? (
        <Link to={url} onClick={onLinkClick}>
          {title}
        </Link>
      ) : (
        <div>{title}</div>
      )}
    </StyledStep>
  );
}
