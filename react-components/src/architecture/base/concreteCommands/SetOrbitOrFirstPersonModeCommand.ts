/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { FlexibleControlsType } from '@cognite/reveal';
import { type TranslateKey } from '../utilities/TranslateKey';
import { BaseOptionCommand, OptionType } from '../commands/BaseOptionCommand';
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

  public override get tooltip(): TranslateKey {
    return { key: 'CONTROLS_TYPE_TOOLTIP', fallback: 'Set Camera to Orbit or Fly mode' };
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    const { flexibleCameraManager } = renderTarget;
    flexibleCameraManager.addControlsTypeChangeListener(this._controlsTypeChangeHandler);
  }

  public override dispose(): void {
    super.dispose();
    const { flexibleCameraManager } = this.renderTarget;
    flexibleCameraManager.removeControlsTypeChangeListener(this._controlsTypeChangeHandler);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private readonly _controlsTypeChangeHandler = (_newControlsType: FlexibleControlsType): void => {
    this.update();
  };
}
