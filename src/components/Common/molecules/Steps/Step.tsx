import React from 'react';
import { Icon } from '@cognite/cogs.js';
import { WorkflowStep } from 'modules/workflows';
import { useCompletedSteps } from 'hooks';
import { Link, Flex } from 'components/Common';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { StyledStep, StepNumber, StyledAdditionalText } from './components';

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
  const completedSteps = useCompletedSteps();
  const wasVisited: boolean = completedSteps.includes(workflowStep);
  const isCurrent: boolean = stepIndex === currentStepIndex;
  const isClickable: boolean =
    isCurrent || wasVisited || stepIndex === currentStepIndex + 1;

  const onLinkClick = () => {
    if (workflowStep)
      trackUsage(PNID_METRICS.navigation.stepsWizard, { step: workflowStep });
  };

  const showStepIconOrNumber = (): JSX.Element => {
    if (isCurrent) return <Icon type="ArrowForward" />;
    if (wasVisited) return <Icon type="Checkmark" />;
    const stepNumber = stepIndex + 1;
    return <>{stepNumber}</>;
  };

  const StepContents = (): JSX.Element => (
    <Flex
      row
      style={{
        flexWrap: 'no-wrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <StepNumber small={!!small} isCurrent={isCurrent} wasVisited={wasVisited}>
        {showStepIconOrNumber()}
      </StepNumber>
      <Flex column>
        <div>{title}</div>
        <StyledAdditionalText level={2}>{additionalText}</StyledAdditionalText>
      </Flex>
    </Flex>
  );

  return (
    <StyledStep small={!!small} isCurrent={isCurrent} wasVisited={wasVisited}>
      {isClickable ? (
        <Link to={url} onClick={onLinkClick}>
          <StepContents />
        </Link>
      ) : (
        <StepContents />
      )}
    </StyledStep>
  );
}
