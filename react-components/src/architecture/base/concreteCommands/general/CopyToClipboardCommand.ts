import { type IconName } from '../../utilities/types';
import { BaseCommand } from '../../commands/BaseCommand';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';

type GetStringDelegate = () => string;

export class CopyToClipboardCommand extends BaseCommand {
  public isDone = false; // True when the string has been copied to clipboard (because of the async clipboard API)
  public getString?: GetStringDelegate;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(getString?: GetStringDelegate) {
    super();
    this.getString = getString;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'COPY_TO_CLIPBOARD' };
  }

  public override get icon(): IconName {
    return 'Copy';
  }

  public override get isEnabled(): boolean {
    return this.getString !== undefined;
  }

  public override get hasData(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    this.isDone = false;
    if (this.getString === undefined) {
      return false;
    }
    void navigator.clipboard
      .writeText(this.getString())
      .then((_result) => {
        this.isDone = true;
        this.update();
      })
      .catch((error) => {
        console.error(error);
      });
    return false; // Do not need another update
  }
}
