import { Body, Icon } from '@cognite/cogs.js';
import {
  useClassifierConfig,
  useClassifierCurrentStep,
  useClassifierDescription,
  useClassifierStatus,
} from 'machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import React, { FC } from 'react';
import {
  StepContainer,
  StepContent,
  StepBadgeActive,
  StepBadgeComplete,
  StepBadgeCount,
  Title,
} from './elements';

export const Step: FC<{
  step: Exclude<ClassifierState, 'complete'>;
  index: number;
}> = ({ step, index }) => {
  const status = useClassifierStatus();
  const { title } = useClassifierConfig(step);
  const isCurrentStep = useClassifierCurrentStep(step);
  const description = useClassifierDescription()[step];

  const renderStepBadge = () => {
    if (isCurrentStep) {
      return (
        <StepBadgeActive>
          <Icon type="ArrowForward" />
        </StepBadgeActive>
      );
    }

    if (status[step] === 'done') {
      return (
        <StepBadgeComplete>
          <Icon type="Checkmark" />
        </StepBadgeComplete>
      );
    }

    return <StepBadgeCount>{index + 1}</StepBadgeCount>;
  };

  return (
    <StepContainer $isActive={isCurrentStep}>
      {renderStepBadge()}
      <StepContent $step={!!description}>
        <Title $isActive={isCurrentStep}>{title}</Title>
        <Body level={2}>{description}</Body>
      </StepContent>
    </StepContainer>
  );
};
