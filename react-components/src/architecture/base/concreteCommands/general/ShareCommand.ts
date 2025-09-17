import { type IconName } from '../../utilities/types';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { BaseCommand } from '../../commands/BaseCommand';

export class ShareCommand extends BaseCommand {
  public override get tooltip(): TranslationInput {
    return { key: 'COPY_URL_TO_SHARE' };
  }

  public override get icon(): IconName {
    return 'Share';
  }

  protected override invokeCore(): boolean {
    const url = window.location.href;
    void navigator.clipboard.writeText(url).catch((error) => {
      console.error(error);
    });
    return true;
  }
}
