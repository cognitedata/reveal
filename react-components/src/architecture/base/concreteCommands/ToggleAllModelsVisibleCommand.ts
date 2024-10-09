/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type IconName } from '../utilities/IconName';
import { type TranslateKey } from '../utilities/TranslateKey';

export class ToggleAllModelsVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show or hide all models' };
  }

  public override get icon(): IconName {
    return 'EyeShow';
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.isAnyVisible();
  }

  public override get isEnabled(): boolean {
    return this.renderTarget.viewer.models.length > 0;
  }

  protected override invokeCore(): boolean {
    const isVisible = this.isAnyVisible();
    for (const model of this.renderTarget.viewer.models) {
      model.visible = !isVisible;
    }
    this.renderTarget.invalidate();
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private isAnyVisible(): boolean {
    for (const model of this.renderTarget.viewer.models) {
      if (model.visible) {
        return true;
      }
    }
    return false;
  }
}
