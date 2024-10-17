/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../utilities/TranslateKey';
import { FractionSliderCommand } from '../../commands/FractionSliderCommand';

export class Set360ImagesOpacityCommand extends FractionSliderCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Image Transparency' };
  }

  public override get isEnabled(): boolean {
    return this.renderTarget.get360ImageCollections().next().value !== undefined;
  }

  public override get value(): number {
    const collection = this.renderTarget.get360ImageCollections().next().value;
    return collection?.getImagesOpacity() ?? 1;
  }

  public override set value(value: number) {
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setImagesOpacity(value);
    }
  }
}
