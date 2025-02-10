/*!
 * Copyright 2025 Cognite AS
 */

import { type Signal, signal } from '@cognite/signals';
import { type IconName } from '../utilities/IconName';
import { type TranslationInput } from '../utilities/TranslateInput';
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
    return 'GraphTree';
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
    // Default lower left corner
    return new PopupStyle({ top: 5, right: 5 });
  }
}
