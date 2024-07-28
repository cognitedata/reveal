/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { ToggleCommand } from '../commands/value/ToggleCommand';

export class QualityCommand extends ToggleCommand {
  private _value = false;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'HIGH_FIDELITY', fallback: 'High Fidelity' };
  }

  public override get isChecked(): boolean {
    return this._value;
  }

  public override setChecked(value: boolean): void {
    this._value = value;
  }
}
