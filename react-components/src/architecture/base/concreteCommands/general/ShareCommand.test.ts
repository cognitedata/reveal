import { describe, expect, test } from 'vitest';
import { ShareCommand } from './ShareCommand';
import { isEmpty } from '../../utilities/translation/TranslateInput';

describe(ShareCommand.name, () => {
  test('should have following default behavior', () => {
    const command = new ShareCommand();
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('Share');
    expect(command.isEnabled).toBe(true);
  });

  test('should copy the URL to clipboard', async () => {
    const command = new ShareCommand();
    expect(command.invoke()).toBe(true);
    const text = await navigator.clipboard.readText();
    expect(text).toBe('http://localhost:3000/');
  });
});
