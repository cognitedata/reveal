import { BaseBannerCommand, type TranslationInput } from '../../../../src/architecture';
import { type BannerStatus } from '../../../../src/architecture/base/commands/BaseBannerCommand';

export class TestBannerCommand extends BaseBannerCommand {
  private readonly _content: TranslationInput;
  private readonly _status: BannerStatus;

  constructor(properties?: { content?: TranslationInput; status?: BannerStatus }) {
    super();
    this._content = properties?.content ?? { untranslated: '' };
    this._status = properties?.status ?? super.status;
  }

  public override get status(): BannerStatus {
    return this._status;
  }

  public override get content(): TranslationInput {
    return this._content;
  }
}
