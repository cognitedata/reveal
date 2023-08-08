/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { MenuSection } from './MenuSection';
import { Flex } from '@cognite/cogs.js';
import { WASDKeysNavigation, ArrowKeysNavigation } from '../../Graphics/Keyboard';
import { InstructionText, MouseNavigationGrid } from './elements';

export const KeyboardNavigation = (): ReactElement => {
  return (
    <MenuSection
      title={'Keyboard'}
      subTitle={'Move and look around'}
      description={'Click and hold to move. You can also use mouse in conjunction with keys.'}>
      <Flex gap={16}>
        <MouseNavigationGrid>
          <InstructionText>{'Forward'}</InstructionText>
          <WASDKeysNavigation style={{ width: 150 }} />
          <InstructionText>{'Down'}</InstructionText>
          <InstructionText>{'Up'}</InstructionText>
          <InstructionText>{'Right'}</InstructionText>
          <InstructionText>{'Left'}</InstructionText>
          <InstructionText>{'Back'}</InstructionText>
        </MouseNavigationGrid>
        <MouseNavigationGrid>
          <InstructionText>{'Look Up'}</InstructionText>
          <ArrowKeysNavigation style={{ width: 135 }} />
          <InstructionText>{'Look Right'}</InstructionText>
          <InstructionText>{'Look Left'}</InstructionText>
          <InstructionText>{'Look Down'}</InstructionText>
        </MouseNavigationGrid>
      </Flex>
    </MenuSection>
  );
};
