/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';

export class SetGhostModeCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'GHOST_MODE' };
  }

  public override get isEnabled(): boolean {
    return true;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.renderTarget.ghostMode;
  }

  public setChecked(checked: boolean): void {
    this.renderTarget.ghostMode = checked;
  }

  protected override invokeCore(): boolean {
    this.renderTarget.ghostMode = !this.renderTarget.ghostMode;
    return true;
  }
}
