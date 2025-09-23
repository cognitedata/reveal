import { describe, expect, test } from 'vitest';
import { CustomBannerCommand, type CustomBannerContent } from './CustomBannerCommand';
import { BannerStatus } from './BaseBannerCommand';

describe(CustomBannerCommand.name, () => {
  test('should create command with text and default neutral status', () => {
    const bannerContent: CustomBannerContent = { text: 'Test banner message' };
    const command = new CustomBannerCommand(bannerContent);

    expect(command.content).toEqual({ untranslated: 'Test banner message' });
    expect(command.status).toBe(BannerStatus.Neutral);
    expect(command.isVisible).toBe(true);
  });

  test('should use provided status when specified', () => {
    const bannerContent: CustomBannerContent = {
      text: 'Warning banner',
      status: 'warning'
    };
    const command = new CustomBannerCommand(bannerContent);

    expect(command.content).toEqual({ untranslated: 'Warning banner' });
    expect(command.status).toBe(BannerStatus.Warning);
    expect(command.isVisible).toBe(true);
  });

  test('should handle all banner status types', () => {
    const statusMappings = [
      { string: 'critical', enum: BannerStatus.Critical },
      { string: 'success', enum: BannerStatus.Success },
      { string: 'warning', enum: BannerStatus.Warning },
      { string: 'neutral', enum: BannerStatus.Neutral }
    ];

    statusMappings.forEach(({ string, enum: expectedEnum }) => {
      const content: CustomBannerContent = { text: `${string} banner`, status: string };
      const command = new CustomBannerCommand(content);

      expect(command.status).toBe(expectedEnum);
      expect(command.isVisible).toBe(true);
    });
  });

  test('should handle empty text with custom status', () => {
    const bannerContent: CustomBannerContent = { text: '', status: 'critical' };
    const command = new CustomBannerCommand(bannerContent);

    expect(command.content).toEqual({ untranslated: '' });
    expect(command.status).toBe(BannerStatus.Critical);
    expect(command.isVisible).toBe(true);
  });
});
