/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { BaseFilterCommand, BaseFilterItemCommand } from '../BaseFilterCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';

export class MockFilterCommand extends BaseFilterCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Filter' };
  }

  protected override createChildren(): FilterItemCommand[] {
    return [
      new FilterItemCommand('Red', new Color(Color.NAMES.red)),
      new FilterItemCommand('Green', new Color(Color.NAMES.green)),
      new FilterItemCommand('Blue', new Color(Color.NAMES.blue)),
      new FilterItemCommand('Yellow', new Color(Color.NAMES.yellow)),
      new FilterItemCommand('Cyan', new Color(Color.NAMES.cyan)),
      new FilterItemCommand('Magenta', new Color(Color.NAMES.magenta)),
      new FilterItemCommand('No color')
    ];
  }
}

// Note: This is not exported, as it is only used internally

class FilterItemCommand extends BaseFilterItemCommand {
  private readonly _name: string;
  private readonly _color?: Color;
  private _use = true;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(name: string, color?: Color) {
    super();
    this._name = name;
    this._color = color;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: this._name };
  }

  public override get isChecked(): boolean {
    return this._use;
  }

  public override get color(): Color | undefined {
    return this._color;
  }

  protected override setCheckedCore(value: boolean): boolean {
    if (this._use === value) {
      return false;
    }
    this._use = value;
    return true;
  }
}
