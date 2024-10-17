/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../utilities/TranslateKey';
import { FractionSliderCommand } from '../../commands/FractionSliderCommand';

export class Set360IconsOpacityCommand extends FractionSliderCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Marker transparency' };
  }

  public override get isEnabled(): boolean {
    const collection = this.renderTarget.get360ImageCollections().next().value;
    return collection?.getIconsVisibility() ?? false;
  }

  public override get value(): number {
    const collection = this.renderTarget.get360ImageCollections().next().value;
    return collection?.getIconsOpacity() ?? 1;
  }

  public override set value(value: number) {
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setIconsOpacity(value);
    }
  }
}
