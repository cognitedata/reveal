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
import { BaseOptionCommand } from '../../commands/BaseOptionCommand';
import { TranslationInput } from '../../utilities/TranslateInput';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { QualitySettings } from '../../../../components';
import { isEqual } from 'lodash';
import { getQualitySettingsFromViewer } from '../../utilities/rendering/getQualitySettingsFromViewer';

export class SetQualitySegmentedCommand extends BaseOptionCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();

    FIDELITY_LEVELS.forEach((level) => this.add(new QualityOptionItemCommand(level)));
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'HIGH_FIDELITY' };
  }

  public override get preferSegmentControl(): boolean {
    return true;
  }
}

class QualityOptionItemCommand extends RenderTargetCommand {
  private readonly _fidelityLevel: FidelityLevel;

  public constructor(value: FidelityLevel) {
    super();
    this._fidelityLevel = value;
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: this._fidelityLevel };
  }

  public override get isChecked(): boolean {
    const viewerQualitySettings = getQualitySettingsFromViewer(this.renderTarget.viewer);

    const closestFidelity = getClosestFidelity(viewerQualitySettings);
    return closestFidelity === this._fidelityLevel;
  }

  public override invokeCore(): boolean {
    const thisButtonQuality = getQualityForFidelityLevel(this._fidelityLevel);
    setQualityOnViewer(thisButtonQuality, this.renderTarget.viewer);

    return true;
  }
}

function setQualityOnViewer<T extends DataSourceType>(
  quality: QualitySettings,
  viewer: Cognite3DViewer<T>
): void {
  viewer.setResolutionOptions(quality.resolutionOptions);
  viewer.cadBudget = quality.cadBudget;
  viewer.pointCloudBudget = quality.pointCloudBudget;
}
