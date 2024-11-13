/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../utilities/TranslateKey';
import { FractionSliderCommand } from '../../commands/FractionSliderCommand';
import { type DataSourceType, type Image360Collection } from '@cognite/reveal';

export class Set360IconsOpacityCommand extends FractionSliderCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Marker transparency' }; // @need-translation
  }

  public override get isEnabled(): boolean {
    return this.firstCollection?.getIconsVisibility() ?? false;
  }

  public override get value(): number {
    return this.firstCollection?.getIconsOpacity() ?? 1;
  }

  public override set value(value: number) {
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setIconsOpacity(value);
    }
  }

  private get firstCollection(): Image360Collection<DataSourceType> | undefined {
    return this.renderTarget.get360ImageCollections().next().value;
  }
}
