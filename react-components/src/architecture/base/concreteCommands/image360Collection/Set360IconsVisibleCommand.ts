/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';

export class Set360IconsVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Visible' };
  }

  public override get isEnabled(): boolean {
    return this.renderTarget.get360ImageCollections().next().value !== undefined;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    const collection = this.renderTarget.get360ImageCollections().next().value;
    return collection?.getIconsVisibility() ?? 1;
  }

  protected override invokeCore(): boolean {
    const visible = !this.isChecked;
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setIconsVisibility(visible);
    }
    return true;
  }
}
