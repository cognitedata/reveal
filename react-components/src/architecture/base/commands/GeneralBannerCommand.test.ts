import { describe, expect, test } from 'vitest';
import { GeneralBannerCommand, type GeneralBannerContent } from './GeneralBannerCommand';
import { BannerStatus } from './BaseBannerCommand';

describe(GeneralBannerCommand.name, () => {
  test('should create command with text and default neutral status', () => {
    const bannerContent: GeneralBannerContent = { text: 'Test banner message' };
    const command = new GeneralBannerCommand(bannerContent);

    expect(command.content).toEqual({ untranslated: 'Test banner message' });
    expect(command.status).toBe(BannerStatus.Neutral);
    expect(command.isVisible).toBe(true);
  });

  test('should use provided status when specified', () => {
    const bannerContent: GeneralBannerContent = {
      text: 'Warning banner',
      status: 'warning'
    };
    const command = new GeneralBannerCommand(bannerContent);

    expect(command.content).toEqual({ untranslated: 'Warning banner' });
    expect(command.status).toBe(BannerStatus.Warning);
    expect(command.isVisible).toBe(true);
  });

  test('should handle all banner status types', () => {
    const statusMappings = [
      { string: 'critical', enum: BannerStatus.Critical } as const,
      { string: 'success', enum: BannerStatus.Success } as const,
      { string: 'warning', enum: BannerStatus.Warning } as const,
      { string: 'neutral', enum: BannerStatus.Neutral } as const
    ];

    statusMappings.forEach(({ string, enum: expectedEnum }) => {
      const content: GeneralBannerContent = { text: `${string} banner`, status: string };
      const command = new GeneralBannerCommand(content);

      expect(command.status).toBe(expectedEnum);
      expect(command.isVisible).toBe(true);
    });
  });

  test('should handle empty text with custom status', () => {
    const bannerContent: GeneralBannerContent = { text: '', status: 'critical' };
    const command = new GeneralBannerCommand(bannerContent);

    expect(command.content).toEqual({ untranslated: '' });
    expect(command.status).toBe(BannerStatus.Critical);
    expect(command.isVisible).toBe(true);
  });
});
