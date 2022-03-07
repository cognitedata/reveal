import { Body, Icon } from '@cognite/cogs.js';
import {
  useClassifierConfig,
  useClassifierCurrentStep,
  useClassifierDescription,
  useClassifierStatus,
} from 'src/machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'src/machines/classifier/types';
import React, { FC } from 'react';
import TrainClassifierLabel from 'src/pages/Classifier/pages/TrainClassifier/components/TrainClassifierLabel';
import {
  StepBadgeActive,
  StepBadgeComplete,
  StepBadgeCount,
  StepContainer,
  StepContent,
  Title,
} from './elements';

export const StepWidget: FC<{
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
          <Icon type="ArrowRight" />
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

  const renderDescription = () => {
    if (step === ClassifierState.TRAIN) {
      return <TrainClassifierLabel status={description} />;
    }

    return <Body level={2}>{description}</Body>;
  };

  return (
    <StepContainer $isActive={isCurrentStep}>
      {renderStepBadge()}
      <StepContent $step={Boolean(description)}>
        <Title $isActive={isCurrentStep}>{title}</Title>
        {renderDescription()}
      </StepContent>
    </StepContainer>
  );
};
