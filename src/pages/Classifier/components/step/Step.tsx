import { Body, Icon } from '@cognite/cogs.js';
import {
  useClassifierConfig,
  useClassifierCurrentStep,
  useClassifierDescription,
  useClassifierStatus,
} from 'machines/classifier/selectors/useClassifierSelectors';
import React, { FC } from 'react';
import {
  StepContainer,
  StepContent,
  StepBadgeActive,
  StepBadgeComplete,
  StepBadgeCount,
  Title,
} from './elements';
import { ClassifierState } from './types';

export const Step: FC<{
  step: Exclude<ClassifierState, 'complete'>;
  index: number;
}> = ({ step, index }) => {
  const status = useClassifierStatus();
  const { subtitle, title } = useClassifierConfig(step);
  const isCurrentStep = useClassifierCurrentStep(step);
  const description = useClassifierDescription();

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

  const renderSubtitle = () => {
    if (!subtitle) {
      return null;
    }
    return <Body level={2}>{description[step]}</Body>;
  };

  return (
    <StepContainer $isActive={isCurrentStep}>
      {renderStepBadge()}
      <StepContent>
        <Title $isActive={isCurrentStep}>{title}</Title>
        {renderSubtitle()}
      </StepContent>
    </StepContainer>
  );
};
