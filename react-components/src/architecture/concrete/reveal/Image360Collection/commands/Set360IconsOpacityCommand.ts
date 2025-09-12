import { type TranslationInput } from '../../../../base/utilities/translation/TranslateInput';
import { FractionSliderCommand } from '../../../../base/commands/FractionSliderCommand';
import { Image360CollectionDomainObject } from '../Image360CollectionDomainObject';
import { type RevealRenderTarget } from '../../../../base/renderTarget/RevealRenderTarget';

export class Set360IconsOpacityCommand extends FractionSliderCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'MARKER TRANSPARENCY' };
  }

  public override get isEnabled(): boolean {
    return (
      this.root.getDescendantByType(Image360CollectionDomainObject) !== undefined &&
      this.settingsController.isIconsVisible()
    );
  }

  public override get value(): number {
    return this.settingsController.iconsOpacity();
  }

  public override set value(value: number) {
    this.settingsController.iconsOpacity(value);
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.settingsController.iconsOpacity);
  }
}
