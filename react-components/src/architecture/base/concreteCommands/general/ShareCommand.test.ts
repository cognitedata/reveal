import { describe, expect, test, vi } from 'vitest';
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
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: TEST_URL
    });
    const command = new ShareCommand();
    expect(command.invoke()).toBe(true);
    const text = await navigator.clipboard.readText();
    expect(text).toBe(TEST_URL);
  });
});

const TEST_URL = 'http://cognite.test';
