import { type IconName } from '../../utilities/types';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { BaseCommand } from '../../commands/BaseCommand';

export class ShareCommand extends BaseCommand {
  public isDone = false; // True when the URL has been copied to clipboard (because of the async clipboard API)

  public override get tooltip(): TranslationInput {
    return { key: 'COPY_URL_TO_SHARE' };
  }

  public override get icon(): IconName {
    return 'Share';
  }

  protected override invokeCore(): boolean {
    this.isDone = false;
    const url = window.location.href;
    void navigator.clipboard
      .writeText(url)
      .then(() => {
        this.isDone = true;
        this.update();
      })
      .catch((error) => {
        console.error(error);
      });
    return true; // Return true regardless, use is isDone
  }
}
