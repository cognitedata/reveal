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

    this.add(new SetQualityCommand());
    this.addDivider();
    this.add(new SetPointSizeCommand());
    this.addDivider();
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
