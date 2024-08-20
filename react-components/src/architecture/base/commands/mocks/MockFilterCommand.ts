/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { BaseFilterCommand, BaseFilterItemCommand } from '../BaseFilterCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';
import { CommandsUpdater } from '../../reactUpdaters/CommandsUpdater';

export class MockFilterCommand extends BaseFilterCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _timeStamp: number | undefined = undefined;
  private _useAllColor: boolean = true;
  private readonly _testDynamic: boolean = false; // True to test dynamic updates (for testing purposes)

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Filter' };
  }

  protected override createChildren(): FilterItemCommand[] {
    if (this._useAllColor) {
      return [
        new FilterItemCommand('Red', new Color(Color.NAMES.red)),
        new FilterItemCommand('Green', new Color(Color.NAMES.green)),
        new FilterItemCommand('Blue', new Color(Color.NAMES.blue)),
        new FilterItemCommand('Yellow', new Color(Color.NAMES.yellow)),
        new FilterItemCommand('Cyan', new Color(Color.NAMES.cyan)),
        new FilterItemCommand('Magenta', new Color(Color.NAMES.magenta)),
        new FilterItemCommand('No color')
      ];
    } else {
      return [
        new FilterItemCommand('Black', new Color(Color.NAMES.black)),
        new FilterItemCommand('White', new Color(Color.NAMES.white))
      ];
    }
  }

  public override initializeChildrenIfNeeded(): void {
    if (!this._testDynamic) {
      super.initializeChildrenIfNeeded();
      return;
    }
    // This updates the options every 5 seconds. Used for testing purposes.
    const timeStamp = Date.now();
    if (this._timeStamp !== undefined && Math.abs(this._timeStamp - timeStamp) < 5000) {
      return;
    }
    this._timeStamp = timeStamp;
    this._useAllColor = !this._useAllColor;
    this._children = undefined;
    super.initializeChildrenIfNeeded();
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

  public override invokeCore(): boolean {
    this._use = !this._use;
    return true;
  }

  public override get color(): Color | undefined {
    return this._color;
  }

  public override setChecked(value: boolean): void {
    if (this._use === value) {
      return;
    }
    this._use = value;
    CommandsUpdater.update(this._renderTarget);
  }
}
