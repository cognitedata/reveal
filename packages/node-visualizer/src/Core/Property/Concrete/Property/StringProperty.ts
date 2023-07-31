import { IPropertyParams } from '../../../Property/Base/IPropertyParams';
import { ValueProperty } from '../../../Property/Base/ValueProperty';

export class StringProperty extends ValueProperty<string> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<string>) {
    super(params);
  }
}
