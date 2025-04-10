/*!
 * Copyright 2024 Cognite AS
 */
import {
  FIDELITY_LEVELS,
  FidelityLevel,
  getClosestFidelity,
  getQualityForFidelityLevel,
  MAX_FIDELITY,
  MIN_FIDELITY
} from './fidelityLevels';
import { BaseSliderCommand } from '../../commands/BaseSliderCommand';
import { TranslateDelegate } from '../../utilities/TranslateInput';
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

  public override get value(): FidelityLevel {
    const viewerQualitySettings = this.renderTarget.revealSettingsController.renderQuality();
    return getClosestFidelity(viewerQualitySettings);
  }

  public override set value(value: number) {
    this.update(Changes.renderStyle);
    const rounded = Math.round(value);

    if (!isValidFidelityLevel(rounded)) {
      return;
    }

    const qualitySettings = getQualityForFidelityLevel(rounded);
    this.renderTarget.revealSettingsController.renderQuality(qualitySettings);
  }

  public override getLabel(translate: TranslateDelegate): string {
    return translate({ key: 'RENDER_QUALITY_SLIDER_HEADER' });
  }

  public override get marks(): Record<number, { label: string }> | undefined {
    return FIDELITY_LEVELS.reduce(
      (mapping, level) => {
        mapping[level] = { label: `${level}` };

        return mapping;
      },
      {} as Record<number, { label: string }>
    );
  }
}

function isValidFidelityLevel(value: number): value is FidelityLevel {
  return (FIDELITY_LEVELS as readonly number[]).includes(value);
}
