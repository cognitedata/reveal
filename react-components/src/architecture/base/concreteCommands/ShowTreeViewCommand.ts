import { type Signal, signal } from '@cognite/signals';
import { type IconName } from '../utilities/types';
import { type TranslationInput } from '../utilities/translation/TranslateInput';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { PopupStyle } from '../domainObjectsHelpers/PopupStyle';

export class ShowTreeViewCommand extends RenderTargetCommand {
  private readonly _showTree = signal(false);

  public get showTree(): Signal<boolean> {
    return this._showTree;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Show tree view' };
  }

  public override get icon(): IconName {
    return 'TreeIcon';
  }

  public override get isEnabled(): boolean {
    return true;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this._showTree();
  }

  protected override invokeCore(): boolean {
    this._showTree(!this._showTree());
    return true;
  }

  public getPanelInfoStyle(): PopupStyle {
    if (this.position === undefined) {
      return new PopupStyle({ top: 5, right: 5 });
    }
    return new PopupStyle({
      top: this.position?.y,
      left: this.position?.x,
      margin: 0
    });
  }
}
