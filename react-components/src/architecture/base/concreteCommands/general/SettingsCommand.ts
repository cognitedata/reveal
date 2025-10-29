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

    const generalGroup = new GroupCommand({ title: { untranslated: 'General' } });
    generalGroup.add(new SetQualitySliderCommand());
    generalGroup.add(new QualityWarningBannerCommand());
    generalGroup.add(new SetLengthUnitCommand());
    if (includePois) {
      generalGroup.add(new SetPointsOfInterestVisibleCommand());
    }

    const cadGroup = new GroupCommand({ title: { key: 'CAD_MODELS' } });
    cadGroup.add(new SetGhostModeCommand());

    const pointCloudGroup = new GroupCommand({ title: { key: 'POINT_CLOUDS' } });
    pointCloudGroup.add(new SetPointSizeCommand());
    pointCloudGroup.add(new SetPointColorTypeCommand());
    pointCloudGroup.add(new SetPointShapeCommand());
    pointCloudGroup.add(new PointCloudFilterCommand());

    const images360Group = new GroupCommand({ title: { key: 'IMAGES_360' } });
    if (include360Images) {
      images360Group.add(new Set360ImagesOpacityCommand());
      images360Group.add(new Set360IconsOpacityCommand());
      images360Group.add(new Set360IconsSectionCommand());

      const rowCommand = new GroupCommand({ isAccordion: false });
      rowCommand.add(new Set360IconsVisibleCommand());
      rowCommand.add(new Set360IconsOccludedVisibleCommand());
      images360Group.add(rowCommand);
    }

    this.add(generalGroup);
    this.add(cadGroup);
    this.add(pointCloudGroup);
    this.add(images360Group);
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
