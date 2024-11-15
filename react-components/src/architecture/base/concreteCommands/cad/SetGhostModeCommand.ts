/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';

export class SetGhostModeCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'GHOST_MODE', fallback: 'Ghost mode' };
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

  protected override invokeCore(): boolean {
    this.renderTarget.ghostMode = !this.renderTarget.ghostMode;
    return true;
  }
}
