import { type IconName } from '../../utilities/types';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { BaseCommand } from '../../commands/BaseCommand';

export class ShareCommand extends BaseCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'COPY_URL_TO_SHARE' };
  }

  public override get icon(): IconName {
    return 'Share';
  }

  protected override invokeCore(): boolean {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then((_result) => {
        return true;
      })
      .catch((error) => {
        console.error(error);
      });
    return true;
  }
}
