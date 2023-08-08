/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { MenuSection } from './MenuSection';
import { Flex } from '@cognite/cogs.js';
import { WASDKeysNavigation, ArrowKeysNavigation } from '../../Graphics/Keyboard';
import { InstructionText, NavigationInstructionGrid } from './elements';

export const KeyboardNavigation = (): ReactElement => {
  return (
    <MenuSection
      title={'Keyboard'}
      subTitle={'Move and look around'}
      description={'Click and hold to move.\nYou can also use mouse in conjunction with keys.'}>
      <Flex gap={16}>
        <NavigationInstructionGrid>
          <InstructionText>{'Forward'}</InstructionText>
          <InstructionText>
            <br /> {'Down'} <br /> <br /> <br /> <InstructionText>{'Left'}</InstructionText>
          </InstructionText>
          <WASDKeysNavigation style={{ width: 150 }} />
          <InstructionText>
            <br /> {'Up'} <br /> <br /> <br /> <InstructionText>{'Right'}</InstructionText>
          </InstructionText>
          <wbr />
          <InstructionText>{'Back'}</InstructionText>
        </NavigationInstructionGrid>
        <NavigationInstructionGrid>
          <InstructionText>{'Look Up'}</InstructionText>
          <InstructionText>
            <br /> <br /> <br /> {'Look Right'}
          </InstructionText>
          <ArrowKeysNavigation style={{ width: 135 }} />
          <InstructionText>
            <br /> <br /> <br /> {'Look Left'}
          </InstructionText>
          <wbr />
          <InstructionText>{'Look Down'}</InstructionText>
        </NavigationInstructionGrid>
      </Flex>
    </MenuSection>
  );
};
