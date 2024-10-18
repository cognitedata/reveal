/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { type IconName } from '../utilities/IconName';

import { BaseSettingsCommand } from '../commands/BaseSettingsCommand';
import { SetQualityCommand } from './SetQualityCommand';
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

export class SettingsCommand extends BaseSettingsCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(includeNextRelease: boolean = true) {
    super();

    this.add(new SetQualityCommand());

    // Point clouds
    this.add(new PointCloudDividerCommand());
    this.add(new SetPointSizeCommand());
    this.add(new SetPointColorTypeCommand());
    this.add(new SetPointShapeCommand());
    this.add(new PointCloudFilterCommand());

    if (includeNextRelease) {
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
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'SETTINGS_TOOLTIP', fallback: 'Settings' };
  }

  public override get icon(): IconName | undefined {
    return 'Settings';
  }
}
