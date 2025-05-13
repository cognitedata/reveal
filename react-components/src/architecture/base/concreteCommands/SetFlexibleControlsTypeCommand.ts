/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { FlexibleControlsType } from '@cognite/reveal';
import { type BaseCommand } from '../commands/BaseCommand';
import { type TranslationInput } from '../utilities/TranslateInput';
import { type IconName } from '../utilities/IconName';
import { effect, type Signal } from '@cognite/signals';

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
    return this.currentControlsType() === this._controlsType;
  }

  protected override invokeCore(): boolean {
    if (this.currentControlsType() === this._controlsType) {
      return false;
    }
    this.currentControlsType(this._controlsType);
    return true;
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    if (!this._standAlone) {
      return; // Done by parent
    }
    this.addDisposable(
      effect(() => {
        this.currentControlsType();
        this.update();
      })
    );
  }

  private get currentControlsType(): Signal<FlexibleControlsType> {
    return this.renderTarget.revealSettingsController.cameraControlsType;
  }
}
