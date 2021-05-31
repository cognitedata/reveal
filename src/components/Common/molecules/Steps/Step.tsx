import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Colors, Icon, Body } from '@cognite/cogs.js';
import { moveToStep, WorkflowStep } from 'modules/workflows';
import { Link, Flex } from 'components/Common';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';

type StyledStepProps = {
  small: boolean;
  isCurrent: boolean;
  isPrevious: boolean;
};
const StyledStep = styled.div<StyledStepProps>`
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  justify-content: flex-start;
  align-items: flex-start;
  user-select: none;
  width: 100%;
  margin: 8px 0;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 8px;
  font-size: ${({ small }) => (small ? '12px' : '16px')};
  cursor: ${({ isPrevious }) => (isPrevious ? 'pointer' : 'default')};
  color: ${({ isCurrent }) =>
    isCurrent
      ? Colors['greyscale-grey9'].hex()
      : Colors['greyscale-grey6'].hex()};
  a {
    color: ${Colors['greyscale-grey6'].hex()};
  }
  &:hover {
    background-color: ${({ isPrevious }) => (isPrevious ? '#f7f8fa' : 'none')};
  }
`;

const StepNumber = styled.span.attrs((props: StyledStepProps) => {
  const { isCurrent, isPrevious } = props;
  const style: any = {
    backgroundColor: Colors.white.hex(),
    border: `3px solid ${Colors['greyscale-grey6'].hex()}`,
  };
  if (isCurrent) {
    style.backgroundColor = Colors.midblue.hex();
    style.color = Colors.white.hex();
    style.border = `3px solid ${Colors.midblue.hex()}`;
  }
  if (isPrevious) {
    style.backgroundColor = Colors.green.hex();
    style.color = Colors.white.hex();
    style.border = `3px solid ${Colors.green.hex()}`;
  }
  return { style };
})<StyledStepProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  min-width: ${({ small }) => (small ? '24px' : '32px')};
  min-height: ${({ small }) => (small ? '24px' : '32px')};
  padding: 1px;
  border-radius: 20px;
  box-sizing: border-box;
  user-select: none;
  color: ${({ isCurrent }) =>
    isCurrent
      ? Colors['greyscale-grey9'].hex()
      : Colors['greyscale-grey6'].hex()};
`;

const StyledAdditionalText = styled(Body)`
  color: #8c8c8c;
  font-weight: normal;
`;

type StepProps = {
  title: string | React.ReactNode;
  url: string;
  stepIndex: number;
  currentStepIndex: number;
  additionalText?: string;
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
    additionalText,
  } = props;
  const dispatch = useDispatch();
  const isPrevious: boolean = stepIndex < currentStepIndex;
  const isCurrent: boolean = stepIndex === currentStepIndex;

  const onLinkClick = () => {
    if (workflowStep) {
      trackUsage(PNID_METRICS.navigation.stepsWizard, {
        step: workflowStep,
      });
      dispatch(moveToStep(workflowStep));
    }
  };

  const showStepIconOrNumber = (): JSX.Element => {
    if (isCurrent) return <Icon type="ArrowForward" />;
    if (isPrevious) return <Icon type="Checkmark" />;
    const stepNumber = stepIndex + 1;
    return <>{stepNumber}</>;
  };

  return (
    <StyledStep small={!!small} isCurrent={isCurrent} isPrevious={isPrevious}>
      <StepNumber small={!!small} isCurrent={isCurrent} isPrevious={isPrevious}>
        {showStepIconOrNumber()}
      </StepNumber>
      <Flex column>
        {isPrevious ? (
          <Link to={url} onClick={onLinkClick}>
            {title}
          </Link>
        ) : (
          <div>{title}</div>
        )}
        <StyledAdditionalText level={2}>{additionalText}</StyledAdditionalText>
      </Flex>
    </StyledStep>
  );
}
