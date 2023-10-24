import styled from 'styled-components';

import { Body, Colors, Detail, Flex, Title } from '@cognite/cogs.js';

import {
  ArrowsNavigation,
  Rotate,
  WASDNavigation,
  PinchRight,
  Mouse,
} from '@data-exploration-components';
import { useTranslation } from '@data-exploration-lib/core';

interface HelpMenuSectionProps {
  children: React.ReactNode;
  title: string;
}

export const HelpMenuSection = ({
  children,
  title,
}: HelpMenuSectionProps): JSX.Element => (
  <StyledSectionContainer>
    <StyledSectionTitle>{title}</StyledSectionTitle>
    <StyledSectionContent>{children}</StyledSectionContent>
  </StyledSectionContainer>
);

export const MouseNavigation = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <HelpMenuSection title={t('MOUSE', 'Mouse')}>
      <StyledMouseNavigationGrid>
        <StyledInstructionText>
          {t('ZOOM', 'Zoom')}{' '}
          <StyledInstructionDetail>
            {t('SCROLL', 'scroll')}
          </StyledInstructionDetail>
        </StyledInstructionText>
        <StyledInstructionText>
          {t('ROTATE', 'Rotate')}
          <br />
          <StyledInstructionDetail>
            {t('CLICK_N_DRAG', 'click+drag')}
          </StyledInstructionDetail>
        </StyledInstructionText>
        <StyledMouseGraphic />
        <StyledInstructionText>
          {t('PAN', 'Pan')}
          <br />
          <StyledInstructionDetail>
            {t('CLICK_N_DRAG', 'click+drag')}
          </StyledInstructionDetail>
        </StyledInstructionText>
      </StyledMouseNavigationGrid>
    </HelpMenuSection>
  );
};

export const TouchNavigation = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <HelpMenuSection title={t('TOUCH', 'Touch')}>
      <StyledTouchNavigationContainer>
        <Flex direction="column" gap={4}>
          <StyledInstructionText>
            {t('ROTATE', 'Rotate')}{' '}
            <StyledInstructionDetail>
              {t('CLICK', 'click')}
            </StyledInstructionDetail>
          </StyledInstructionText>
          <Rotate />
        </Flex>
        <Flex direction="column" gap={4}>
          <StyledInstructionText>
            {t('ZOOM', 'Zoom')}{' '}
            <StyledInstructionDetail>
              {t('PINCH', 'pinch')}
            </StyledInstructionDetail>
          </StyledInstructionText>
          <PinchRight style={{ width: 80 }} />
        </Flex>
      </StyledTouchNavigationContainer>
    </HelpMenuSection>
  );
};

export const KeyboardNavigation = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <HelpMenuSection title={t('KEYBOARD', 'Keyboard')}>
      <Flex gap={16}>
        <WASDNavigation style={{ width: 150 }} />
        <ArrowsNavigation style={{ width: 135 }} />
      </Flex>
    </HelpMenuSection>
  );
};

export const StyledSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StyledSectionTitle = styled(Title).attrs({ level: 5 })`
  color: ${Colors['text-icon--strong--inverted']};
`;

const StyledSectionContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 100%;
`;

export const StyledInstructionText = styled(Body).attrs({
  level: 3,
  strong: true,
})`
  color: ${Colors['text-icon--medium--inverted']};
`;

export const StyledInstructionDetail = styled(Detail)`
  color: ${Colors['text-icon--interactive--disabled--inverted']};
`;

export const StyledMouseNavigationGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 8px;
  width: 220px;

  ${StyledInstructionText}:first-of-type {
    padding-left: 10px;
    grid-column: 1/-1;
    text-align: center;
  }

  ${StyledInstructionText}:last-of-type {
    text-align: right;
  }
`;

export const StyledMouseGraphic = styled(Mouse)`
  display: flex;
  justify-content: center;

  ::before {
    content: '';
    position: absolute;
    display: inline-block;
    margin-top: 12px;
    width: 110px;
    border-top: 1px solid white;
  }
`;

export const StyledTouchNavigationContainer = styled.div`
  display: flex;
  gap: 16px;
  width: 176px;
`;
