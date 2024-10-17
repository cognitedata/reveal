/*!
 * Copyright 2024 Cognite AS
 */

import { BaseSettingsCommand } from '../commands/BaseSettingsCommand';
import { SetQualityCommand } from './SetQualityCommand';
import { SetPointSizeCommand } from './pointcloud/SetPointSizeCommand';
import { SetPointColorTypeCommand } from './pointcloud/SetPointColorTypeCommand';
import { SetPointShapeCommand } from './pointcloud/SetPointShapeCommand';
import { PointCloudFilterCommand } from './pointcloud/PointCloudFilterCommand';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type IconName } from '../utilities/IconName';
import { PointCloudDividerCommand } from './pointcloud/PointCloudDividerCommand';

export class SettingsCommand extends BaseSettingsCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();

    this.add(new SetQualityCommand());
    this.add(new PointCloudDividerCommand());
    this.add(new SetPointSizeCommand());
    this.add(new SetPointColorTypeCommand());
    this.add(new SetPointShapeCommand());
    this.add(new PointCloudFilterCommand());
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
