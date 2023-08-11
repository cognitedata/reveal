/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Section } from './Section';
import { Flex } from '@cognite/cogs.js';
import { ArrowKeysNavigation, QWEASDKeysNavigation } from './Graphics/Keyboard';
import {
  InstructionText,
  KeyboardNavigationInstructionGrid,
  ArrowKeyboardNavigationInstructionGrid
} from './elements';

export const KeyboardNavigation = (): ReactElement => {
  return (
    <Section
      title={'Keyboard'}
      subTitle={'Move and look around'}
      description={'Click and hold to move.\nYou can also use mouse in conjunction with keys.'}>
      <Flex gap={8} style={{ paddingTop: 12 }}>
        <Flex direction="column">
          <KeyboardNavigationInstructionGrid>
            <InstructionText>Down</InstructionText>
            <InstructionText>Forward</InstructionText>
            <InstructionText>Up</InstructionText>
            <QWEASDKeysNavigation.Q />
            <QWEASDKeysNavigation.W />
            <QWEASDKeysNavigation.E />
          </KeyboardNavigationInstructionGrid>
          <KeyboardNavigationInstructionGrid style={{ paddingLeft: 15, paddingTop: 8 }}>
            <QWEASDKeysNavigation.A />
            <QWEASDKeysNavigation.S style={{ marginLeft: 6 }} />
            <QWEASDKeysNavigation.D style={{ marginLeft: 6 }} />
            <InstructionText>Left</InstructionText>
            <InstructionText>Back</InstructionText>
            <InstructionText>Right</InstructionText>
          </KeyboardNavigationInstructionGrid>
        </Flex>
        <ArrowKeyboardNavigationInstructionGrid>
          <InstructionText>Look Up</InstructionText>
          <InstructionText>Look Left</InstructionText>
          <ArrowKeysNavigation.Up />
          <InstructionText>Look Right</InstructionText>
          <ArrowKeysNavigation.Left />
          <ArrowKeysNavigation.Down />
          <ArrowKeysNavigation.Right />
          <br />
          <InstructionText>Look Down</InstructionText>
        </ArrowKeyboardNavigationInstructionGrid>
      </Flex>
    </Section>
  );
};
