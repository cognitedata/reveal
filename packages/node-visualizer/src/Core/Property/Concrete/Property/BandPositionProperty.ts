import { BandPosition } from '../../../Enums/BandPosition';
import { IPropertyParams } from '../../../Property/Base/IPropertyParams';
import { ValueProperty } from '../../../Property/Base/ValueProperty';

export class BandPositionProperty extends ValueProperty<BandPosition> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<BandPosition>) {
    super(params);
    this.options = Object(BandPosition);
  }
}
