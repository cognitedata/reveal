/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { FlexibleControlsType } from '@cognite/reveal';
import { type BaseCommand, type Tooltip } from '../commands/BaseCommand';

export class SetFlexibleControlsTypeCommand extends RenderTargetCommand {
  private readonly _controlsType: FlexibleControlsType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(controlsType: FlexibleControlsType) {
    super();
    this._controlsType = controlsType;
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    const { flexibleCameraManager } = renderTarget;
    flexibleCameraManager.addControlsTypeChangeListener(this._controlsTypeChangeHandler);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public equals(other: BaseCommand): boolean {
    if (!(other instanceof SetFlexibleControlsTypeCommand)) {
      return false;
    }
    return this._controlsType === other._controlsType;
  }

  public override dispose(): void {
    super.dispose();
    const { flexibleCameraManager } = this.renderTarget;
    flexibleCameraManager.removeControlsTypeChangeListener(this._controlsTypeChangeHandler);
  }

  public override get icon(): string {
    switch (this._controlsType) {
      case FlexibleControlsType.FirstPerson:
        return 'Plane';
      case FlexibleControlsType.Orbit:
        return 'Circle';
      case FlexibleControlsType.OrbitInCenter:
        return 'Coordinates';
      default:
        return 'Error';
    }
  }

  public override get tooltip(): Tooltip {
    switch (this._controlsType) {
      case FlexibleControlsType.FirstPerson:
        return { key: 'CONTROLS_TYPE_FIRST_PERSON', fallback: 'Fly' };
      case FlexibleControlsType.Orbit:
        return { key: 'CONTROLS_TYPE_ORBIT', fallback: 'Orbit' };
      case FlexibleControlsType.OrbitInCenter:
        return { key: 'CONTROLS_TYPE_ORBIT_IN_CENTER', fallback: 'Center Orbit' };
      default:
        return super.tooltip;
    }
  }

  public override get isCheckable(): boolean {
    return true;
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

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private readonly _controlsTypeChangeHandler = (_newControlsType: FlexibleControlsType): void => {
    this.update();
  };
}
