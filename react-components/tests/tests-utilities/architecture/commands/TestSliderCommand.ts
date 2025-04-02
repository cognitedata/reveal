import { BaseSliderCommand } from '../../../../src/architecture';

export class TestSliderCommand extends BaseSliderCommand {
  private _value: number;

  constructor() {
    super(0, 10, 1);
    this._value = 0;
  }

  public override get value(): number {
    return this._value;
  }

  public override set value(value: number) {
    this._value = value;
  }
}
