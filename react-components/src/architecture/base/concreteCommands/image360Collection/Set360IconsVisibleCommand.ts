/*!
 * Copyright 2024 Cognite AS
 */

import { type DataSourceType, type Image360Collection } from '@cognite/reveal';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';

export class Set360IconsVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Visible' }; // @need-translation
  }

  public override get isEnabled(): boolean {
    return this.firstCollection !== undefined;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.firstCollection?.getIconsVisibility() ?? true;
  }

  protected override invokeCore(): boolean {
    const visible = !this.isChecked;
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setIconsVisibility(visible);
    }
    return true;
  }

  private get firstCollection(): Image360Collection<DataSourceType> | undefined {
    return this.renderTarget.get360ImageCollections().next().value;
  }
}
