/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Section } from './Section';
import { Flex } from '@cognite/cogs.js';
import { QWEKeysNavigation, ArrowKeysNavigation, ASDKeysNavigation } from './Graphics/Keyboard';
import { InstructionText, KeyboardNavigationInstructionGrid } from './elements';

export const KeyboardNavigation = (): ReactElement => {
  return (
    <Section
      title={'Keyboard'}
      subTitle={'Move and look around'}
      description={'Click and hold to move.\nYou can also use mouse in conjunction with keys.'}>
      <Flex gap={16}>
        <KeyboardNavigationInstructionGrid>
          <InstructionText>Forward</InstructionText>
          <InstructionText style={{ marginRight: -30 }}>Down</InstructionText>
          <QWEKeysNavigation style={{ width: 150 }} />
          <InstructionText style={{ marginLeft: -60 }}>Up</InstructionText>

          <InstructionText style={{ marginRight: -60 }}>Left</InstructionText>
          <ASDKeysNavigation style={{ width: 180, marginLeft: 30 }} />
          <InstructionText style={{ marginLeft: -10 }}>Right</InstructionText>
          <br />
          <InstructionText style={{ marginLeft: 33 }}>Back</InstructionText>
        </KeyboardNavigationInstructionGrid>
        <KeyboardNavigationInstructionGrid>
          <InstructionText>Look Up</InstructionText>
          <InstructionText style={{ marginTop: 45 }}>Look Left</InstructionText>
          <ArrowKeysNavigation style={{ width: 135 }} />
          <InstructionText style={{ marginTop: 45 }}>Look Right</InstructionText>
          <br />
          <InstructionText>Look Down</InstructionText>
        </KeyboardNavigationInstructionGrid>
      </Flex>
    </Section>
  );
};
