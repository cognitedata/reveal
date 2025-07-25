import { type TranslationInput } from '../utilities/TranslateInput';
import { type IconName } from '../utilities/IconName';

import { BaseSettingsCommand } from '../commands/BaseSettingsCommand';
import { SetPointSizeCommand } from './pointCloud/SetPointSizeCommand';
import { SetPointColorTypeCommand } from './pointCloud/SetPointColorTypeCommand';
import { SetPointShapeCommand } from './pointCloud/SetPointShapeCommand';
import { PointCloudFilterCommand } from './pointCloud/PointCloudFilterCommand';
import { PointCloudDividerCommand } from './pointCloud/PointCloudDividerCommand';
import { Image360CollectionDividerCommand } from './image360Collection/Image360CollectionDividerCommand';
import { Set360ImagesSectionCommand } from './image360Collection/Set360ImagesSectionCommand';
import { Set360ImagesOpacityCommand } from './image360Collection/Set360ImagesOpacityCommand';
import { Set360IconsSectionCommand } from './image360Collection/Set360IconsSectionCommand';
import { Set360IconsVisibleCommand } from './image360Collection/Set360IconsVisibleCommand';
import { Set360IconsOpacityCommand } from './image360Collection/Set360IconsOpacityCommand';
import { Set360IconsOccludedVisibleCommand } from './image360Collection/Set360IconsOccludedVisibleCommand';
import { SetPointsOfInterestVisibleCommand } from '../../concrete/pointsOfInterest/SetPointsOfInterestVisibleCommand';
import { PointsOfInterestDividerCommand } from '../../concrete/pointsOfInterest/PointsOfInterestDividerCommand';
import { PointsOfInterestSectionCommand } from '../../concrete/pointsOfInterest/PointsOfInterestSectionCommand';
import { SetGhostModeCommand } from './cad/SetGhostModeCommand';
import { SetQualitySliderCommand } from './SetQualitySliderCommand/SetQualitySliderCommand';
import { QualityWarningBannerCommand } from './SetQualitySliderCommand/QualityWarningBannerCommand';
import { DividerCommand } from '../commands/DividerCommand';
import { SetLengthUnitCommand } from './units/SetLengthUnitCommand';

export class SettingsCommand extends BaseSettingsCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(include360Images: boolean = true, includePois: boolean = false) {
    super();

    this.add(new SetQualitySliderCommand());
    this.add(new QualityWarningBannerCommand());

    this.add(new DividerCommand());
    this.add(new SetGhostModeCommand());

    // Point clouds
    this.add(new PointCloudDividerCommand());
    this.add(new SetPointSizeCommand());
    this.add(new SetPointColorTypeCommand());
    this.add(new SetPointShapeCommand());
    this.add(new PointCloudFilterCommand());

    if (include360Images) {
      // 360 Images
      this.add(new Image360CollectionDividerCommand());
      this.add(new Set360ImagesSectionCommand());
      this.add(new Set360ImagesOpacityCommand());

      // 360 Markers
      this.add(new Set360IconsSectionCommand());
      this.add(new Set360IconsVisibleCommand());
      this.add(new Set360IconsOccludedVisibleCommand());
      this.add(new Set360IconsOpacityCommand());
    }

    this.add(new DividerCommand());
    this.add(new SetLengthUnitCommand());

    if (includePois) {
      this.add(new PointsOfInterestDividerCommand());
      this.add(new PointsOfInterestSectionCommand());
      this.add(new SetPointsOfInterestVisibleCommand());
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'SETTINGS_TOOLTIP' };
  }

  public override get icon(): IconName {
    return 'Settings';
  }
}
