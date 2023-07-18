import React from 'react';

import { Icon } from '@cognite/cogs.js';

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
            >
              {state.backButton || 'Back'}
            </OrientationButtonPrevious>
          )}
          <OrientationButtonNext type="tertiary" size="small" {...primaryProps}>
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
        icon="CloseLarge"
        aria-label="Close orientation"
      />
    </OrientationWrapper>
  );
};
