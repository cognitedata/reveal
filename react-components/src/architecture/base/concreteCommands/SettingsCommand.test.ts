import { describe, expect, test } from 'vitest';
import { CopyToClipboardCommand } from './CopyToClipboardCommand';
import { isEmpty } from '../utilities/TranslateInput';
import { SettingsCommand } from './SettingsCommand';

describe(CopyToClipboardCommand.name, () => {
  test('should have following default behavior', () => {
    const command = new SettingsCommand();
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('Settings');
    expect(command.isEnabled).toBe(true);
  });

  test('should have all children', async () => {
    const command = new SettingsCommand(true, true);
    expect(command.hasChildren).toBe(true);
    expect(command.children.length).toBe(19);
  });

  test('should not have all children', async () => {
    const command = new SettingsCommand(false, false);
    expect(command.hasChildren).toBe(true);
    expect(command.children.length).toBe(9);
  });

  test('should clear all children', async () => {
    const command = new SettingsCommand();
    command.clear();
    expect(command.hasChildren).toBe(false);
    expect(command.children.length).toBe(0);
  });
});
