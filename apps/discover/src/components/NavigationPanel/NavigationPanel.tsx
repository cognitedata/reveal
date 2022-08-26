import * as React from 'react';

import { BackButton, BaseButton } from '../Buttons';

import {
  DetailsContainer,
  NavigationPanelContainer,
  Title,
  Subtitle,
} from './elements';

interface Props {
  title: string;
  subtitle?: string;
  isPreviousButtonDisabled?: boolean;
  isNextButtonDisabled?: boolean;
  onPreviousClick?: () => void;
  onNextClick?: () => void;
  onBackClick: () => void;
}

export const NavigationPanel: React.FC<Props> = ({
  title,
  subtitle,
  isPreviousButtonDisabled,
  isNextButtonDisabled,
  onBackClick,
  onNextClick,
  onPreviousClick,
}) => {
  return (
    <NavigationPanelContainer>
      <BackButton type="secondary" onClick={onBackClick} />

      <DetailsContainer>
        <Title data-testid="title">{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </DetailsContainer>

      <>
        {onPreviousClick && (
          <BaseButton
            icon="ChevronLeft"
            type="secondary"
            onClick={onPreviousClick}
            disabled={isPreviousButtonDisabled}
            aria-label="previous-wellbore"
          />
        )}

        {onNextClick && (
          <BaseButton
            icon="ChevronRight"
            type="secondary"
            onClick={onNextClick}
            disabled={isNextButtonDisabled}
            aria-label="next-wellbore"
          />
        )}
      </>
    </NavigationPanelContainer>
  );
};
