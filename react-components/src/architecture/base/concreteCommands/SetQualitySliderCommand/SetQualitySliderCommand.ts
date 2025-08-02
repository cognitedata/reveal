import {
  FIDELITY_LEVELS,
  type FidelityLevel,
  getClosestFidelity,
  getQualityForFidelityLevel,
  MAX_FIDELITY,
  MIN_FIDELITY
} from './fidelityLevels';
import { BaseSliderCommand } from '../../commands/BaseSliderCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { Changes } from '../../domainObjectsHelpers/Changes';

export class SetQualitySliderCommand extends BaseSliderCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(MIN_FIDELITY, MAX_FIDELITY, 1);
  }

  // ==================================================
  // OVERRIDES
  // =================================================

  public override get tooltip(): TranslationInput {
    return { key: 'RENDER_QUALITY_SLIDER_HEADER' };
  }

  public override get value(): FidelityLevel {
    const renderQuality = this.settingsController.renderQuality();
    return getClosestFidelity(renderQuality);
  }

  public override set value(value: number) {
    this.update(Changes.renderStyle);
    const rounded = Math.round(value);

    if (!isValidFidelityLevel(rounded)) {
      return;
    }

    const renderQuality = getQualityForFidelityLevel(rounded);
    this.settingsController.renderQuality(renderQuality);
  }

  public override get marks(): Record<number, { label: string }> | undefined {
    return FIDELITY_LEVELS.reduce<Record<number, { label: string }>>((mapping, level) => {
      mapping[level] = { label: `${level}` };

      return mapping;
    }, {});
  }
}

function isValidFidelityLevel(value: number): value is FidelityLevel {
  return (FIDELITY_LEVELS as readonly number[]).includes(value);
}
