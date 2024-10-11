/*!
 * Copyright 2024 Cognite AS
 */

import { BaseSettingsCommand } from '../commands/BaseSettingsCommand';
import { SetQualityCommand } from './SetQualityCommand';
import { SetPointSizeCommand } from './SetPointSizeCommand';
import { SetPointColorTypeCommand } from './SetPointColorTypeCommand';
import { SetPointShapeCommand } from './SetPointShapeCommand';
import { PointCloudFilterCommand } from './PointCloudFilterCommand';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type IconName } from '../utilities/IconName';

export class SettingsCommand extends BaseSettingsCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();

    this.addCommand(new SetQualityCommand());
    this.addDivider();
    this.addCommand(new SetPointSizeCommand());
    this.addDivider();
    this.addCommand(new SetPointColorTypeCommand());
    this.addCommand(new SetPointShapeCommand());
    this.addCommand(new PointCloudFilterCommand());
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
