import { type ReactElement } from 'react';
import { Section } from './Section';
import { Flex } from '@cognite/cogs.js';
import { ArrowKeysNavigation, QWEASDKeysNavigation } from './Graphics/Keyboard';
import {
  InstructionText,
  KeyboardNavigationInstructionGrid,
  ArrowKeyboardNavigationInstructionGrid
} from './elements';
import { useTranslation } from '../../i18n/I18n';

export type KeyboardNavigationProps = {
  fallbackLanguage?: string;
};

export const KeyboardNavigation = ({ fallbackLanguage }: KeyboardNavigationProps): ReactElement => {
  const { t } = useTranslation(fallbackLanguage);
  return (
    <Section
      title={t({ key: 'KEYBOARD_NAVIGATION_TITLE' })}
      subTitle={t({ key: 'KEYBOARD_NAVIGATION_SUBTITLE' })}
      description={t({ key: 'KEYBOARD_NAVIGATION_DESCRIPTION' })}>
      <Flex gap={8} style={{ paddingTop: 12 }}>
        <Flex direction="column">
          <KeyboardNavigationInstructionGrid>
            <InstructionText> {t({ key: 'KEYBOARD_DOWN' })} </InstructionText>
            <InstructionText>{t({ key: 'KEYBOARD_FORWARD' })}</InstructionText>
            <InstructionText>{t({ key: 'KEYBOARD_UP' })}</InstructionText>
            <QWEASDKeysNavigation.Q />
            <QWEASDKeysNavigation.W />
            <QWEASDKeysNavigation.E />
          </KeyboardNavigationInstructionGrid>
          <KeyboardNavigationInstructionGrid style={{ paddingLeft: 15, paddingTop: 8 }}>
            <QWEASDKeysNavigation.A />
            <QWEASDKeysNavigation.S style={{ marginLeft: 6 }} />
            <QWEASDKeysNavigation.D style={{ marginLeft: 6 }} />
            <InstructionText>{t({ key: 'KEYBOARD_LEFT' })}</InstructionText>
            <InstructionText>{t({ key: 'KEYBOARD_BACK' })}</InstructionText>
            <InstructionText>{t({ key: 'KEYBOARD_RIGHT' })}</InstructionText>
          </KeyboardNavigationInstructionGrid>
        </Flex>
        <ArrowKeyboardNavigationInstructionGrid>
          <InstructionText>{t({ key: 'KEYBOARD_LOOK_UP' })}</InstructionText>
          <InstructionText>{t({ key: 'KEYBOARD_LOOK_LEFT' })}</InstructionText>
          <ArrowKeysNavigation.Up />
          <InstructionText>{t({ key: 'KEYBOARD_LOOK_RIGHT' })}</InstructionText>
          <ArrowKeysNavigation.Left />
          <ArrowKeysNavigation.Down />
          <ArrowKeysNavigation.Right />
          <br />
          <InstructionText>{t({ key: 'KEYBOARD_LOOK_DOWN' })}</InstructionText>
        </ArrowKeyboardNavigationInstructionGrid>
      </Flex>
    </Section>
  );
};
