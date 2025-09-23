import { BannerStatus, BaseBannerCommand } from './BaseBannerCommand';
import { type TranslationInput } from '../utilities/translation/TranslateInput';

export type CustomBannerContent = {
  text: string;
  status?: 'critical' | 'success' | 'warning' | 'neutral';
};

export class CustomBannerCommand extends BaseBannerCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================
  protected readonly _bannerStatus: BannerStatus;
  protected readonly _bannerText: string;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================
  public constructor(bannerContent: CustomBannerContent) {
    super();
    this._bannerStatus = this.mapStringToBannerStatus(bannerContent.status);
    this._bannerText = bannerContent.text;
  }

  private mapStringToBannerStatus(status?: string): BannerStatus {
    switch (status) {
      case 'critical':
        return BannerStatus.Critical;
      case 'success':
        return BannerStatus.Success;
      case 'warning':
        return BannerStatus.Warning;
      case 'neutral':
        return BannerStatus.Neutral;
      default:
        return BannerStatus.Neutral;
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================
  public override get content(): TranslationInput {
    return { untranslated: this._bannerText };
  }

  public override get status(): BannerStatus {
    return this._bannerStatus;
  }

  public override get isVisible(): boolean {
    return true;
  }
}
