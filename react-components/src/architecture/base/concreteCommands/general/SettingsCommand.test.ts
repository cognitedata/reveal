import { describe, expect, test } from 'vitest';
import { isEmpty } from '../../utilities/translation/TranslateInput';
import { SettingsCommand } from './SettingsCommand';
import { type GeneralBannerContent } from '../../commands/GeneralBannerCommand';

describe(SettingsCommand.name, () => {
  const bannerContent: GeneralBannerContent = { text: 'Test banner message' };
  test('should have following default behavior', () => {
    const command = new SettingsCommand();
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('Settings');
    expect(command.isEnabled).toBe(true);
  });

  test('should have all children', async () => {
    const command = new SettingsCommand(true, true, bannerContent);
    expect(command.hasChildren).toBe(true);
    expect(command.children.length).toBe(22);
  });

  test('should have banner when banner content is provided', async () => {
    const command = new SettingsCommand(true, true, bannerContent);
    expect(command.hasChildren).toBe(true);
    expect(command.children.length).toBe(22);
  });

  test('should only show default settings when no extra settings are provided', async () => {
    const command = new SettingsCommand(false, false, undefined);
    expect(command.hasChildren).toBe(true);
    expect(command.children.length).toBe(11);
  });

  test('should show 360 image settings when include360Images is true', async () => {
    const command = new SettingsCommand(true, false, undefined);
    expect(command.hasChildren).toBe(true);
    expect(command.children.length).toBe(18);
  });

  test('should show poi settings when includePois is true', async () => {
    const command = new SettingsCommand(false, true, undefined);
    expect(command.hasChildren).toBe(true);
    expect(command.children.length).toBe(14);
  });

  test('should show banner when banner content is provided', async () => {
    const command = new SettingsCommand(false, false, bannerContent);
    expect(command.hasChildren).toBe(true);
    expect(command.children.length).toBe(12);
  });

  test('should clear all children', async () => {
    const command = new SettingsCommand();
    command.clear();
    expect(command.hasChildren).toBe(false);
    expect(command.children.length).toBe(0);
  });
});
