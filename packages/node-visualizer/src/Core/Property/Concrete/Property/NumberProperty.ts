import { IPropertyParams } from '../../../Property/Base/IPropertyParams';
import { ValueProperty } from '../../../Property/Base/ValueProperty';

export class NumberProperty extends ValueProperty<number> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<number>) {
    super(params);
  }
}
