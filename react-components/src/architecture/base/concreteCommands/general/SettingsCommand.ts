import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { type IconName } from '../../utilities/types';

import { BaseSettingsCommand } from '../../commands/BaseSettingsCommand';
import { SetPointSizeCommand } from '../../../concrete/reveal/pointCloud/commands/SetPointSizeCommand';
import { SetPointColorTypeCommand } from '../../../concrete/reveal/pointCloud/commands/SetPointColorTypeCommand';
import { SetPointShapeCommand } from '../../../concrete/reveal/pointCloud/commands/SetPointShapeCommand';
import { PointCloudFilterCommand } from '../../../concrete/reveal/pointCloud/commands/PointCloudFilterCommand';
import { Set360ImagesOpacityCommand } from '../../../concrete/reveal/Image360Collection/commands/Set360ImagesOpacityCommand';
import { Set360IconsSectionCommand } from '../../../concrete/reveal/Image360Collection/commands/Set360IconsSectionCommand';
import { Set360IconsVisibleCommand } from '../../../concrete/reveal/Image360Collection/commands/Set360IconsVisibleCommand';
import { Set360IconsOpacityCommand } from '../../../concrete/reveal/Image360Collection/commands/Set360IconsOpacityCommand';
import { Set360IconsOccludedVisibleCommand } from '../../../concrete/reveal/Image360Collection/commands/Set360IconsOccludedVisibleCommand';
import { SetPointsOfInterestVisibleCommand } from '../../../concrete/pointsOfInterest/SetPointsOfInterestVisibleCommand';
import { SetGhostModeCommand } from '../../../concrete/reveal/cad/commands/SetGhostModeCommand';
import { SetQualitySliderCommand } from '../quality/SetQualitySliderCommand';
import { QualityWarningBannerCommand } from '../quality/QualityWarningBannerCommand';
import { SetLengthUnitCommand } from '../units/SetLengthUnitCommand';
import {
  GeneralBannerCommand,
  type GeneralBannerContent
} from '../../commands/GeneralBannerCommand';
import { GroupCommand } from '../../commands/GroupCommand';
import { type BaseCommand } from '../../commands/BaseCommand';
import { RowCommand } from '../../commands/RowCommand';

export class SettingsCommand extends BaseSettingsCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(
    include360Images: boolean = true,
    includePois: boolean = false,
    topBannerContent?: GeneralBannerContent
  ) {
    super();

    if (topBannerContent !== undefined) {
      this.add(new GeneralBannerCommand(topBannerContent));
    }

    const generalGroupCommands: BaseCommand[] = [
      new SetQualitySliderCommand(),
      new QualityWarningBannerCommand(),
      new SetLengthUnitCommand()
    ];
    const cadGroupCommands: BaseCommand[] = [new SetGhostModeCommand()];
    const pointCloudGroupCommands: BaseCommand[] = [
      new SetPointSizeCommand(),
      new SetPointColorTypeCommand(),
      new SetPointShapeCommand(),
      new PointCloudFilterCommand()
    ];
    const images360GroupCommands: BaseCommand[] = [];

    if (includePois) {
      generalGroupCommands.push(new SetPointsOfInterestVisibleCommand());
    }
    if (include360Images) {
      images360GroupCommands.push(new Set360ImagesOpacityCommand());
      images360GroupCommands.push(new Set360IconsOpacityCommand());

      images360GroupCommands.push(new Set360IconsSectionCommand());
      images360GroupCommands.push(
        new RowCommand({
          commands: [new Set360IconsVisibleCommand(), new Set360IconsOccludedVisibleCommand()]
        })
      );
    }

    this.add(new GroupCommand({ title: 'General', commands: generalGroupCommands }));
    this.add(new GroupCommand({ title: 'CAD', commands: cadGroupCommands }));
    this.add(new GroupCommand({ title: 'Point cloud', commands: pointCloudGroupCommands }));
    this.add(new GroupCommand({ title: '360', commands: images360GroupCommands }));
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
