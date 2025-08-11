import { type TranslationInput } from '../../utilities/TranslateInput';
import { FractionSliderCommand } from '../../commands/FractionSliderCommand';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';

export class Set360ImagesOpacityCommand extends FractionSliderCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'IMAGE_TRANSPARENCY' };
  }

  public override get isEnabled(): boolean {
    return this.rootDomainObject.getDescendantByType(Image360CollectionDomainObject) !== undefined;
  }

  public override get value(): number {
    return this.settingsController._imagesOpacity();
  }

  public override set value(value: number) {
    this.settingsController._imagesOpacity(value);
  }
}
