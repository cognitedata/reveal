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
import { useI18n } from '../../i18n/I18n';

export const KeyboardNavigation = (): ReactElement => {
  const { t } = useI18n();
  return (
    <Section
      title={t('KEYBOARD_NAVIGATION_TITLE', 'Keyboard')}
      subTitle={t('KEYBOARD_NAVIGATION_SUBTITLE', 'Move and look around')}
      description={t(
        'KEYBOARD_NAVIGATION_DESCRIPTION',
        'Click and hold to move.\nYou can also use mouse in conjunction with keys.'
      )}>
      <Flex gap={8} style={{ paddingTop: 12 }}>
        <Flex direction="column">
          <KeyboardNavigationInstructionGrid>
            <InstructionText> {t('KEYBOARD_DOWN', 'Down')} </InstructionText>
            <InstructionText>{t('KEYBOARD_FORWARD', 'Forward')}</InstructionText>
            <InstructionText>{t('KEYBOARD_UP', 'Up')}</InstructionText>
            <QWEASDKeysNavigation.Q />
            <QWEASDKeysNavigation.W />
            <QWEASDKeysNavigation.E />
          </KeyboardNavigationInstructionGrid>
          <KeyboardNavigationInstructionGrid style={{ paddingLeft: 15, paddingTop: 8 }}>
            <QWEASDKeysNavigation.A />
            <QWEASDKeysNavigation.S style={{ marginLeft: 6 }} />
            <QWEASDKeysNavigation.D style={{ marginLeft: 6 }} />
            <InstructionText>{t('KEYBOARD_LEFT', 'Left')}</InstructionText>
            <InstructionText>{t('KEYBOARD_BACK', 'Back')}</InstructionText>
            <InstructionText>{t('KEYBOARD_RIGHT', 'Right')}</InstructionText>
          </KeyboardNavigationInstructionGrid>
        </Flex>
        <ArrowKeyboardNavigationInstructionGrid>
          <InstructionText>{t('KEYBOARD_LOOK_UP', 'Look Up')}</InstructionText>
          <InstructionText>{t('KEYBOARD_LOOK_LEFT', 'Look Left')}</InstructionText>
          <ArrowKeysNavigation.Up />
          <InstructionText>{t('KEYBOARD_LOOK_RIGHT', 'Look Right')}</InstructionText>
          <ArrowKeysNavigation.Left />
          <ArrowKeysNavigation.Down />
          <ArrowKeysNavigation.Right />
          <br />
          <InstructionText>{t('KEYBOARD_LOOK_DOWN', 'Look Down')}</InstructionText>
        </ArrowKeyboardNavigationInstructionGrid>
      </Flex>
    </Section>
  );
};
