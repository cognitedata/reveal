import { IPropertyParams } from '../../../Property/Base/IPropertyParams';
import { ValueProperty } from '../../../Property/Base/ValueProperty';

export class BooleanProperty extends ValueProperty<boolean> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<boolean>) {
    super(params);
  }
}
