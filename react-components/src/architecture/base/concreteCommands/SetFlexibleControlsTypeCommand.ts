/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { FlexibleControlsType } from '@cognite/reveal';
import { type BaseCommand } from '../commands/BaseCommand';
import { type TranslationInput } from '../utilities/TranslateInput';
import { type IconName } from '../utilities/IconName';

export class SetFlexibleControlsTypeCommand extends RenderTargetCommand {
  private readonly _controlsType: FlexibleControlsType;
  private readonly _standAlone: boolean; // False if part of a group

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(controlsType: FlexibleControlsType, standAlone: boolean = true) {
    super();
    this._controlsType = controlsType;
    this._standAlone = standAlone;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  protected override get shortCutKey(): string | undefined {
    return this._controlsType === FlexibleControlsType.Orbit ? '1' : '2';
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof SetFlexibleControlsTypeCommand)) {
      return false;
    }
    return this._controlsType === other._controlsType;
  }

  public override dispose(): void {
    super.dispose();
    if (!this._standAlone) {
      return; // Done by parent
    }
    const { flexibleCameraManager } = this.renderTarget;
    flexibleCameraManager.removeControlsTypeChangeListener(this._controlsTypeChangeHandler);
  }

  public override get icon(): IconName {
    switch (this._controlsType) {
      case FlexibleControlsType.FirstPerson:
        return 'Plane';
      case FlexibleControlsType.Orbit:
        return 'Circle';
      case FlexibleControlsType.OrbitInCenter:
        return 'Coordinates';
      default:
        return undefined;
    }
  }

  public override get tooltip(): TranslationInput {
    switch (this._controlsType) {
      case FlexibleControlsType.FirstPerson:
        return { key: 'CONTROLS_TYPE_FIRST_PERSON' };
      case FlexibleControlsType.Orbit:
        return { key: 'CONTROLS_TYPE_ORBIT' };
      case FlexibleControlsType.OrbitInCenter:
        return { key: 'CONTROLS_TYPE_ORBIT_IN_CENTER' };
      default:
        return super.tooltip ?? { untranslated: '' };
    }
  }

  public override get isChecked(): boolean {
    const { renderTarget } = this;
    const { flexibleCameraManager } = renderTarget;
    return flexibleCameraManager.controlsType === this._controlsType;
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    const { flexibleCameraManager } = renderTarget;
    if (flexibleCameraManager.controlsType === this._controlsType) {
      return false;
    }
    flexibleCameraManager.controlsType = this._controlsType;
    return true;
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    if (!this._standAlone) {
      return; // Done by parent
    }
    const { flexibleCameraManager } = renderTarget;
    flexibleCameraManager.addControlsTypeChangeListener(this._controlsTypeChangeHandler);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private readonly _controlsTypeChangeHandler = (_newControlsType: FlexibleControlsType): void => {
    this.update();
  };
}
