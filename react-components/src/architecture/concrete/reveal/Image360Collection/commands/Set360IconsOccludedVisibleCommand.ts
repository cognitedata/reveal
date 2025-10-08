import { RenderTargetCommand } from '../../../../base/commands/RenderTargetCommand';

import { type TranslationInput } from '../../../../base/utilities/translation/TranslateInput';
import { Image360CollectionDomainObject } from '../Image360CollectionDomainObject';
import { type RevealRenderTarget } from '../../../../base/renderTarget/RevealRenderTarget';

export class Set360IconsOccludedVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'X_RAY' };
  }

  public override get isEnabled(): boolean {
    return this.root.getDescendantByType(Image360CollectionDomainObject) !== undefined;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.settingsController.isOccludedIconsVisible();
  }

  protected override invokeCore(): boolean {
    this.settingsController.isOccludedIconsVisible(
      !this.settingsController.isOccludedIconsVisible()
    );
    return true;
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.settingsController.isOccludedIconsVisible);
  }
}
