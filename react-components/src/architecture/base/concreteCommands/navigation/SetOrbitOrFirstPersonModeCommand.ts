import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';
import { FlexibleControlsType } from '@cognite/reveal';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { BaseOptionCommand, OptionType } from '../../commands/BaseOptionCommand';
import { SetFlexibleControlsTypeCommand } from './SetFlexibleControlsTypeCommand';

export class SetOrbitOrFirstPersonModeCommand extends BaseOptionCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(OptionType.Segmented);
    this.add(new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit, false));
    this.add(new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson, false));
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'CONTROLS_TYPE_TOOLTIP' };
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.settingsController.cameraControlsType);
  }
}
