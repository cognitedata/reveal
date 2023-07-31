import Color from 'color';

import { IPropertyParams } from '../../../Property/Base/IPropertyParams';
import { ValueProperty } from '../../../Property/Base/ValueProperty';

export class ColorProperty extends ValueProperty<Color> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<Color>) {
    super(params);
  }
}
