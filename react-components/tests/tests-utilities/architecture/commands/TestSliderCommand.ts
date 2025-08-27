import { BaseSliderCommand } from '../../../../src/architecture';

const TEST_SLIDER_MIN = 0;
const TEST_SLIDER_MAX = 10;
const TEST_SLIDER_STEP = 1;

export class TestSliderCommand extends BaseSliderCommand {
  private _value: number;

  constructor() {
    super(TEST_SLIDER_MIN, TEST_SLIDER_MAX, TEST_SLIDER_STEP);
    this._value = 0;
  }

  public override get value(): number {
    return this._value;
  }

  public override set value(value: number) {
    this._value = value;
  }
}
