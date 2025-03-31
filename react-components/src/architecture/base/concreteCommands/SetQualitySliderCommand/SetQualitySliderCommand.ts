/*!
 * Copyright 2024 Cognite AS
 */
import { DataSourceType, type Cognite3DViewer } from '@cognite/reveal';
import {
  FIDELITY_LEVELS,
  FidelityLevel,
  getClosestFidelity,
  getQualityForFidelityLevel
} from './fidelityLevels';
import { getQualitySettingsFromViewer } from '../../utilities/quality/getQualitySettingsFromViewer';
import { QualitySettings } from '../../utilities/quality/QualitySettings';
import { BaseSliderCommand } from '../../commands/BaseSliderCommand';
import { TranslateDelegate } from '../../utilities/TranslateInput';
import { Changes } from '../../domainObjectsHelpers/Changes';

export class SetQualitySliderCommand extends BaseSliderCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(1, 5, 1);
  }

  // ==================================================
  // OVERRIDES
  // =================================================

  public override get value(): FidelityLevel {
    const viewerQualitySettings = getQualitySettingsFromViewer(this.renderTarget.viewer);
    return getClosestFidelity(viewerQualitySettings);
  }

  public override set value(value: number) {
    this.update(Changes.renderStyle);
    const rounded = Math.round(value);

    if (!isValidFidelityLevel(rounded)) {
      return;
    }

    const qualitySettings = getQualityForFidelityLevel(rounded);
    setQualityOnViewer(qualitySettings, this.renderTarget.viewer);
  }

  public override getLabel(translate: TranslateDelegate): string {
    return translate({ untranslated: 'Rendering detail level' });
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

function setQualityOnViewer<T extends DataSourceType>(
  quality: QualitySettings,
  viewer: Cognite3DViewer<T>
): void {
  viewer.setResolutionOptions(quality.resolutionOptions);
  viewer.cadBudget = quality.cadBudget;
  viewer.pointCloudBudget = quality.pointCloudBudget;
}
