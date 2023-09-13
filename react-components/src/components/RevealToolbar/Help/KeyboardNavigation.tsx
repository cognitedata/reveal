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
import { useTranslation } from '../../../common/i18n';

export const KeyboardNavigation = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <Section
      title={t('KEYBOARD_NAVIGATION_TITLE')}
      subTitle={t('KEYBOARD_NAVIGATION_SUBTITLE')}
      description={t('KEYBOARD_NAVIGATION_DESCRIPTION')}>
      <Flex gap={8} style={{ paddingTop: 12 }}>
        <Flex direction="column">
          <KeyboardNavigationInstructionGrid>
            <InstructionText> {t('KEYBOARD_DOWN')} </InstructionText>
            <InstructionText>{t('KEYBOARD_FORWARD')}</InstructionText>
            <InstructionText>{t('KEYBOARD_UP')}</InstructionText>
            <QWEASDKeysNavigation.Q />
            <QWEASDKeysNavigation.W />
            <QWEASDKeysNavigation.E />
          </KeyboardNavigationInstructionGrid>
          <KeyboardNavigationInstructionGrid style={{ paddingLeft: 15, paddingTop: 8 }}>
            <QWEASDKeysNavigation.A />
            <QWEASDKeysNavigation.S style={{ marginLeft: 6 }} />
            <QWEASDKeysNavigation.D style={{ marginLeft: 6 }} />
            <InstructionText>{t('KEYBOARD_LEFT')}</InstructionText>
            <InstructionText>{t('KEYBOARD_BACK')}</InstructionText>
            <InstructionText>{t('KEYBOARD_RIGHT')}</InstructionText>
          </KeyboardNavigationInstructionGrid>
        </Flex>
        <ArrowKeyboardNavigationInstructionGrid>
          <InstructionText>{t('KEYBOARD_LOOK_UP')}</InstructionText>
          <InstructionText>{t('KEYBOARD_LOOK_LEFT')}</InstructionText>
          <ArrowKeysNavigation.Up />
          <InstructionText>{t('KEYBOARD_LOOK_RIGHT')}</InstructionText>
          <ArrowKeysNavigation.Left />
          <ArrowKeysNavigation.Down />
          <ArrowKeysNavigation.Right />
          <br />
          <InstructionText>{t('KEYBOARD_LOOK_DOWN')}</InstructionText>
        </ArrowKeyboardNavigationInstructionGrid>
      </Flex>
    </Section>
  );
};
