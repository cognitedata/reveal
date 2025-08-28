import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';

export class Set360IconsVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'VISIBLE' };
  }

  public override get isEnabled(): boolean {
    return this.rootDomainObject.getDescendantByType(Image360CollectionDomainObject) !== undefined;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.settingsController.isIconsVisible();
  }

  protected override invokeCore(): boolean {
    this.settingsController.isIconsVisible(!this.settingsController.isIconsVisible());
    return true;
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.settingsController.isIconsVisible);
  }
}
