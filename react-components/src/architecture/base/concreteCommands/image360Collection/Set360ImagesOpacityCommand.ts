import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { FractionSliderCommand } from '../../commands/FractionSliderCommand';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';

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
    return this.settingsController.imagesOpacity();
  }

  public override set value(value: number) {
    this.settingsController.imagesOpacity(value);
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.settingsController.imagesOpacity);
  }
}
