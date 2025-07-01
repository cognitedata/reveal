import { describe, expect, test } from 'vitest';
import { CopyToClipboardCommand } from './CopyToClipboardCommand';
import { isEmpty } from '../utilities/TranslateInput';

describe(CopyToClipboardCommand.name, () => {
  test('should have following default behavior', () => {
    const command = new CopyToClipboardCommand();
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('Copy');
    expect(command.isEnabled).toBe(false);
    expect(command.hasData).toBe(true);
  });

  test('should copy to clipboard', async () => {
    const getString = (): string => 'test string';
    const command = new CopyToClipboardCommand(getString);
    expect(command.isEnabled).toBe(true);
    expect(command.invoke()).toBe(true);

    const text = await navigator.clipboard.readText();
    expect(text).toBe('test string');
  });
});
