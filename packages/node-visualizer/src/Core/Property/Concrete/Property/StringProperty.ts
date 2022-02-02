import { ValueProperty } from 'Core/Property/Base/ValueProperty';
import { IPropertyParams } from 'Core/Property/Base/IPropertyParams';

export class StringProperty extends ValueProperty<string> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<string>) {
    super(params);
  }
}
