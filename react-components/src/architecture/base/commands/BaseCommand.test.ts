import { describe, expect, test, vi } from 'vitest';
import { MockCommand } from '#test-utils/architecture/mock-commands/MockCommand';
import { BaseCommand } from './BaseCommand';
import { isUntranslatedString } from '../utilities/TranslateInput';
import { translate } from '../utilities/translateUtils';
import { count } from '../utilities/extensions/generatorUtils';

describe(BaseCommand.name, () => {
  test('should have the following default implementation', async () => {
    const command = new DefaultCommand();
    expect(command.name).toBe('');
    expect(command.tooltip).toBeUndefined();
    expect(command.icon).toBeUndefined();
    expect(command.buttonType).toBe('ghost');
    expect(command.isEnabled).toBe(true);
    expect(command.isVisible).toBe(true);
    expect(command.isToggle).toBe(false);
    expect(command.isChecked).toBe(false);
    expect(command.hasData).toBe(false);
    expect(count(command.getDescendants())).toBe(0);
    expect(command.getLabel(translate)).toBe('');
    expect(command.invoke()).toBe(false);
    expect(command.getShortCutKeys()).toBeUndefined();
  });

  test('should correctly compare equality of commands', async () => {
    const command = new DefaultCommand();
    expect(command.equals(command)).toBe(true);
    expect(command.equals(new MockCommand())).toBe(false);
  });

  test('should invoke command and track count', async () => {
    const command = new MockCommand();
    expect(command.isInvokedTimes).toBe(0);
    expect(command.invoke()).toBe(true);
    expect(command.isInvokedTimes).toBe(1);
  });

  test('should toggle state correctly', async () => {
    const command = new MockCommand();
    command.isToggle = true;
    expect(command.isChecked).toBe(false);
    expect(command.invoke()).toBe(true);
    expect(command.isChecked).toBe(true);
    expect(command.invoke()).toBe(true);
    expect(command.isChecked).toBe(false);
  });

  test('should generate correct tooltip and keys', async () => {
    const command = new MockCommand();
    if (isUntranslatedString(command.tooltip)) {
      const label = command.getLabel(translate);
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

  test('should call all event listeners when updated', async () => {
    const command = new DefaultCommand();

    // Add 2 event listeners
    const mockEventListener1 = vi.fn();
    const mockEventListener2 = vi.fn();
    command.addEventListener(mockEventListener1);
    command.addEventListener(mockEventListener2);

    command.update();
    expect(mockEventListener1).toHaveBeenCalledTimes(1);
    expect(mockEventListener2).toHaveBeenCalledTimes(1);

    command.update();
    expect(mockEventListener1).toHaveBeenCalledTimes(2);
    expect(mockEventListener2).toHaveBeenCalledTimes(2);
  });

  test('should remove event listener', async () => {
    const command = new DefaultCommand();

    // Add 2 event listeners
    const mockEventListener1 = vi.fn();
    const mockEventListener2 = vi.fn();
    command.addEventListener(mockEventListener1);
    command.addEventListener(mockEventListener2);

    // Test that the event listener are not called again after being removed
    command.removeEventListener(mockEventListener1);
    command.update();
    expect(mockEventListener1).toHaveBeenCalledTimes(0);
    expect(mockEventListener2).toHaveBeenCalledTimes(1);
  });

  test('should remove all event listeners on dispose', async () => {
    const command = new DefaultCommand();

    // Add 2 event listeners
    const mockEventListener1 = vi.fn();
    const mockEventListener2 = vi.fn();
    command.addEventListener(mockEventListener1);
    command.addEventListener(mockEventListener2);

    // Test that the event listeners are not called after the command is disposed
    command.dispose();
    command.update();
    expect(mockEventListener1).toHaveBeenCalledTimes(0);
    expect(mockEventListener2).toHaveBeenCalledTimes(0);
  });
});

class DefaultCommand extends BaseCommand {}
