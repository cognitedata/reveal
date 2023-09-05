import React, { useEffect } from 'react';

import { Icon } from '@cognite/cogs.js';

import { ORIENTATION_ACTIONS, ORIENTATION_EVENT } from '../../metrics';

import {
  OrientationButtonClose,
  OrientationButtonNext,
  OrientationButtonPrevious,
  OrientationButtons,
  OrientationCounter,
  OrientationFooter,
  OrientationIconWrapper,
  OrientationWrapper,
  StyledDescription,
  StyledTitle,
} from './elements';
import { useOrientation } from './OrientationContext';
import { OrientationContentProps, OrientationTooltipProps } from './types';

export const OrientationTooltipContent = ({
  title,
  description,
  icon,
}: OrientationContentProps) => {
  return (
    <>
      <OrientationIconWrapper>
        <Icon type={icon} size={24} />
      </OrientationIconWrapper>

      {title && <StyledTitle level={6}>{title}</StyledTitle>}
      {description && (
        <StyledDescription level={2}>{description}</StyledDescription>
      )}
    </>
  );
};

export const OrientationTooltip = ({
  backProps,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  size,

  tooltipProps,
}: OrientationTooltipProps) => {
  const { state } = useOrientation();
  const { onTrackEvent } = state;
  const currentStep = `orientation-step-${index + 1}`;
  useEffect(() => {
    onTrackEvent?.(ORIENTATION_EVENT, {
      step: currentStep,
      flowName: state.id,
      action: ORIENTATION_ACTIONS.STARTED,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNext = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (isLastStep) {
      onTrackEvent?.(ORIENTATION_EVENT, {
        step: currentStep,
        action: ORIENTATION_ACTIONS.LAST_STEP,
        flowName: state.id,
      });
    } else {
      onTrackEvent?.(ORIENTATION_EVENT, {
        step: currentStep,
        action: ORIENTATION_ACTIONS.NEXT,
        flowName: state.id,
      });
    }
    if (primaryProps.onClick) {
      primaryProps.onClick(e);
    }
  };
  const onClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onTrackEvent?.(ORIENTATION_EVENT, {
      step: currentStep,
      action: ORIENTATION_ACTIONS.CLOSED,
      flowName: state.id,
    });
    if (skipProps.onClick) {
      skipProps.onClick(e);
    }
  };
  const onBack = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onTrackEvent?.(ORIENTATION_EVENT, {
      step: currentStep,
      action: ORIENTATION_ACTIONS.PREVIOUS,
      flowName: state.id,
    });
    if (backProps.onClick) {
      backProps.onClick(e);
    }
  };

  return (
    <OrientationWrapper data-testid={`orientation-${index}`} {...tooltipProps}>
      {step.content}
      <OrientationFooter>
        <OrientationCounter>
          <span>{index + 1}</span>
          <span className="counter--total">/{size}</span>
        </OrientationCounter>
        <OrientationButtons>
          {index > 0 && (
            <OrientationButtonPrevious
              size="small"
              inverted
              type="ghost"
              {...backProps}
              onClick={onBack}
            >
              {state.backButton || 'Back'}
            </OrientationButtonPrevious>
          )}
          <OrientationButtonNext
            type="tertiary"
            size="small"
            {...primaryProps}
            onClick={onNext}
          >
            {isLastStep
              ? state.lastStepButton || 'Got it!'
              : state.nextButton || 'Next'}
          </OrientationButtonNext>
        </OrientationButtons>
      </OrientationFooter>
      <OrientationButtonClose
        size="small"
        type="ghost"
        {...skipProps}
        onClick={onClose}
        icon="CloseLarge"
        aria-label="Close orientation"
      />
    </OrientationWrapper>
  );
};
