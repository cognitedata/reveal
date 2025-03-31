import { BannerStatus, BaseBannerCommand } from '../../commands/BaseBannerCommand';
import { IconName } from '../../utilities/IconName';
import { getQualitySettingsFromViewer } from '../../utilities/quality/getQualitySettingsFromViewer';
import { TranslationInput } from '../../utilities/TranslateInput';
import { getClosestFidelity, MAX_FIDELITY } from './fidelityLevels';

export class QualityWarningBannerCommand extends BaseBannerCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get isVisible(): boolean {
    const viewerQualitySettings = getQualitySettingsFromViewer(this.renderTarget.viewer);

    const closestFidelity = getClosestFidelity(viewerQualitySettings);
    return closestFidelity === MAX_FIDELITY;
  }

  public override get content(): TranslationInput {
    return { untranslated: 'High detail might overload CPU/GPU/RAM' };
  }

  public override get status(): BannerStatus {
    return BannerStatus.Warning;
  }

  public override get icon(): IconName | undefined {
    return 'WarningFilled';
  }
}
