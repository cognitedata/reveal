import * as React from 'react';

import { Flex } from '@cognite/cogs.js';

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
  additionalActionComponent?: React.ReactElement;
}

export const NavigationPanel: React.FC<Props> = ({
  title,
  subtitle,
  isPreviousButtonDisabled,
  isNextButtonDisabled,
  onBackClick,
  onNextClick,
  onPreviousClick,
  additionalActionComponent,
}) => {
  return (
    <NavigationPanelContainer>
      <Flex alignItems="center">
        <BackButton type="secondary" onClick={onBackClick} />

        <DetailsContainer>
          <Title data-testid="title">{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </DetailsContainer>
      </Flex>
      <Flex>
        {additionalActionComponent}

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
      </Flex>
    </NavigationPanelContainer>
  );
};
