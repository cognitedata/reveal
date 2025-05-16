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
  private readonly _value: FlexibleControlsType;
  private readonly _standAlone: boolean; // False if part of a group

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(value: FlexibleControlsType, standAlone: boolean = true) {
    super();
    this._value = value;
    this._standAlone = standAlone;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  protected override get shortCutKey(): string | undefined {
    switch (this._value) {
      case FlexibleControlsType.FirstPerson:
        return '2';
      case FlexibleControlsType.Orbit:
        return '1';
      default:
        return super.shortCutKey;
    }
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof SetFlexibleControlsTypeCommand)) {
      return false;
    }
    return this._value === other._value;
  }

  public override get icon(): IconName {
    switch (this._value) {
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
    switch (this._value) {
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
    return this._value === this.currentControlsType();
  }

  protected override invokeCore(): boolean {
    if (this._value === this.currentControlsType()) {
      return false;
    }
    this.currentControlsType(this._value);
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
