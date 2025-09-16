import { type IconName } from '../../utilities/types';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { BaseCommand } from '../../commands/BaseCommand';

export class HelpCommand extends BaseCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  private _isChecked = false;

  public override get tooltip(): TranslationInput {
    return { key: 'HELP_TOOLTIP' };
  }

  public override get icon(): IconName {
    return 'Help';
  }

  public override get isChecked(): boolean {
    return this._isChecked;
  }

  public override set isChecked(value: boolean) {
    if (value === this._isChecked) {
      return;
    }
    this._isChecked = value;
    this.update();
  }
}
