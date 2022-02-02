// It goes from 0 to 1

import { IPropertyParams } from '../../Base/IPropertyParams';
import { ValueProperty } from '../../Base/ValueProperty';

export class SliderProperty extends ValueProperty<number> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<number>) {
    super(params);
  }
}
