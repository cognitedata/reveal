import { type IconName } from '../../base/utilities/IconName';
import { BaseCommand } from '../commands/BaseCommand';
import { type TranslationInput } from '../utilities/TranslateInput';

type GetStringDelegate = () => string;

export class CopyToClipboardCommand extends BaseCommand {
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
    if (this.getString === undefined) {
      return false;
    }
    navigator.clipboard
      .writeText(this.getString())
      .then((_result) => {
        return true;
      })
      .catch((error) => {
        console.error(error);
      });
    return true;
  }
}
