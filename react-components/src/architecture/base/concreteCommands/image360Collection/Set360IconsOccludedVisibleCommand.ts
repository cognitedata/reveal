/*!
 * Copyright 2024 Cognite AS
 */

import { type Image360Collection } from '@cognite/reveal';
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
    return this.firstCollection?.getIconsVisibility() ?? false;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.firstCollection?.isOccludedIconsVisible() ?? true;
  }

  protected override invokeCore(): boolean {
    const visible = !this.isChecked;
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setOccludedIconsVisible(visible);
    }
    return true;
  }

  private get firstCollection(): Image360Collection | undefined {
    return this.renderTarget.get360ImageCollections().next().value;
  }
}
