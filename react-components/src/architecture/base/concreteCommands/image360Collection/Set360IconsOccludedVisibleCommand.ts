/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';

export class Set360IconsOccludedVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'X-ray' }; // @need-translation
  }

  public override get isEnabled(): boolean {
    const collection = this.renderTarget.get360ImageCollections().next().value;
    return collection?.getIconsVisibility() ?? false;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    const collection = this.renderTarget.get360ImageCollections().next().value;
    return collection?.getOccludedIconsVisible() ?? 1;
  }

  protected override invokeCore(): boolean {
    const visible = !this.isChecked;
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setOccludedIconsVisible(visible);
    }
    return true;
  }
}
