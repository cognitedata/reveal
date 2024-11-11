/*!
 * Copyright 2024 Cognite AS
 */

import { type CogniteCadModel } from '@cognite/reveal';
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
    return this.firstModel !== undefined;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    const model = this.firstModel;
    if (model === undefined) {
      return false;
    }
    const appearance = model.getDefaultNodeAppearance();
    return appearance.renderGhosted ?? false;
  }

  protected override invokeCore(): boolean {
    const ghosted = !this.isChecked;
    for (const model of this.renderTarget.getCadModels()) {
      const appearance = model.getDefaultNodeAppearance();
      const clone = { ...appearance };
      clone.renderGhosted = ghosted;
      model.setDefaultNodeAppearance(clone);
    }
    return true;
  }

  private get firstModel(): CogniteCadModel | undefined {
    return this.renderTarget.getCadModels().next().value;
  }
}
