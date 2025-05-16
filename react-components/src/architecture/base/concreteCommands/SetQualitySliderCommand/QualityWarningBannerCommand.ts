import { effect } from '@cognite/signals';
import { BannerStatus, BaseBannerCommand } from '../../commands/BaseBannerCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { getClosestFidelity, MAX_FIDELITY } from './fidelityLevels';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';

export class QualityWarningBannerCommand extends BaseBannerCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get isVisible(): boolean {
    const closestFidelity = getClosestFidelity(
      this.renderTarget.revealSettingsController.renderQuality()
    );
    return closestFidelity === MAX_FIDELITY;
  }

  public override get content(): TranslationInput {
    return { key: 'RENDER_QUALITY_SLIDER_PERFORMANCE_WARNING' };
  }

  public override get status(): BannerStatus {
    return BannerStatus.Warning;
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);

    // Until `isVisible` becomes a signal, we have to propagate setting updates like this
    effect(() => {
      this.renderTarget.revealSettingsController.renderQuality();
      this.update();
    });
  }
}
