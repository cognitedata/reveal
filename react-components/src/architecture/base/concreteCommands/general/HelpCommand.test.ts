import { describe, expect, test } from 'vitest';
import { HelpCommand } from './HelpCommand';
import { isEmpty } from '../../utilities/translation/TranslateInput';

describe(HelpCommand.name, () => {
  test('should have following default behavior', () => {
    const command = new HelpCommand();
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('Help');
    expect(command.isEnabled).toBe(true);
    expect(command.isChecked).toBe(false);
  });

  test('should be checked and unchecked', async () => {
    const command = new HelpCommand();
    command.isChecked = true;
    expect(command.isChecked).toBe(true);
    command.isChecked = true;
    expect(command.isChecked).toBe(true);
    command.isChecked = false;
    expect(command.isChecked).toBe(false);
  });
});
