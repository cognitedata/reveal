import React from 'react';
import { Link } from 'react-router-dom';

import { Icon } from '@cognite/cogs.js';

import { getUrlWithQueryParams } from '../../../..//utils/config';
import { useCompletedSteps } from '../../../../hooks';
import { WorkflowStep } from '../../../../modules/types';
import { PNID_METRICS, trackUsage } from '../../../../utils/Metrics';
import { Flex } from '../../atoms';

import { StyledStep, StepNumber } from './components';
import { StepCombo } from './StepCombo';
import { StepLabel } from './StepLabel';
import { StepsType } from './types';
type StepProps = {
  title: React.ReactNode;
  url: string;
  stepIndex: number;
  currentStepIndex: number;
  small?: boolean;
  workflowStep?: WorkflowStep;
  substeps?: StepsType[];
};

export default function Step(props: StepProps) {
  const {
    title,
    url,
    stepIndex,
    currentStepIndex,
    small,
    workflowStep,
    substeps,
  } = props;
  const completedSteps = useCompletedSteps();

  const isCombo = Boolean(substeps);
  const wasVisited: boolean = completedSteps.includes(workflowStep);
  const isCurrent: boolean = stepIndex === currentStepIndex;
  const isClickable: boolean =
    isCurrent || wasVisited || stepIndex === currentStepIndex + 1;

  const onLinkClick = () => {
    if (workflowStep)
      trackUsage(PNID_METRICS.navigation.stepsWizard, { step: workflowStep });
  };

  const showStepIconOrNumber = (): JSX.Element => {
    if (isCurrent) return <Icon type="ArrowRight" size={small ? 14 : 16} />;
    if (wasVisited) return <Icon type="Checkmark" size={small ? 14 : 16} />;
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
      <Flex column style={{ width: '100%' }}>
        <div data-testid="create-interactive-diagrams-step-title">{title}</div>
        <StepLabel step={workflowStep} />
        {isCombo && isCurrent && <StepCombo substeps={substeps} />}
      </Flex>
    </Flex>
  );

  return (
    <StyledStep
      small={!!small}
      isCurrent={isCurrent}
      wasVisited={wasVisited}
      data-testid="create-interactive-diagrams-step"
    >
      {isClickable ? (
        <Link to={getUrlWithQueryParams(url)} onClick={onLinkClick}>
          <StepContents />
        </Link>
      ) : (
        <StepContents />
      )}
    </StyledStep>
  );
}
