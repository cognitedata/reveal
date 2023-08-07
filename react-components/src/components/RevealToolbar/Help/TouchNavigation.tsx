/*!
 * Copyright 2023 Cognite AS
 */

import { Flex } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import { MenuSection } from './MenuSection';
import { InstructionDetail, InstructionText, MouseNavigationGrid } from './elements';
import { Touch } from '../../Graphics/Touch';

export const TouchNavigation = (): ReactElement => {
  return (
    <MenuSection title={'Touch'}>
      <MouseNavigationGrid>
        <Flex direction="column" gap={4}>
          <InstructionText>
            {'Rotate'}
            <br />
            <InstructionDetail>{'click'}</InstructionDetail>
          </InstructionText>
          <Touch />
        </Flex>
        <Flex direction="column" gap={4}>
          <InstructionText>
            {'Zoom'}
            <br />
            <InstructionDetail>{'pinch'}</InstructionDetail>
          </InstructionText>
        </Flex>
      </MouseNavigationGrid>
    </MenuSection>
  );
};
