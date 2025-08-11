import { type TranslationInput } from '../../utilities/TranslateInput';
import { FractionSliderCommand } from '../../commands/FractionSliderCommand';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';

export class Set360IconsOpacityCommand extends FractionSliderCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'MARKER TRANSPARENCY' };
  }

  public override get isEnabled(): boolean {
    if (this.rootDomainObject.getDescendantByType(Image360CollectionDomainObject) === undefined) {
      return false;
    }
    return this.settingsController._isIconsVisible();
  }

  public override get value(): number {
    return this.settingsController._iconsOpacity();
  }

  public override set value(value: number) {
    this.settingsController._iconsOpacity(value);
  }
}
