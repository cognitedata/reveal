import { describe, expect, test } from 'vitest';
import { MockCommand } from '#test-utils/architecture/mock-commands/MockCommand';
import { BaseCommand } from './BaseCommand';
import { Translator } from '../../../components/i18n/Translator';
import { isUntranslatedString } from '../utilities/TranslateInput';

// Help page here:  https://bogr.dev/blog/react-testing-intro/

describe(BaseCommand.name, () => {
  test('should invoke', async () => {
    const command = new MockCommand();
    expect(command.isInvokedTimes).toBe(0);

    command.invoke();

    expect(command.isInvokedTimes).toBe(1);
  });

  test('should check', async () => {
    const command = new MockCommand();
    command.isToggle = true;
    expect(command.isChecked).toBe(false);
    expect(command.isInvokedTimes).toBe(0);

    command.invoke();

    expect(command.isInvokedTimes).toBe(1);
    expect(command.isChecked).toBe(true);
  });

  test('should get correct string for generating the tooltip', async () => {
    const command = new MockCommand();

    if (isUntranslatedString(command.tooltip)) {
      const label = command.getLabel(Translator.instance.translate);
      expect(label).toBe(command.tooltip.untranslated);

      expect(command.name).toBe(command.tooltip.untranslated);
    }
    const keys = command.getShortCutKeys();
    expect(keys).toHaveLength(4);
    expect(keys).toBeOneOf([
      ['Ctrl', 'Alt', 'Shift', 'A'],
      ['Cmd', 'Alt', 'Shift', 'A']
    ]);
  });
});
