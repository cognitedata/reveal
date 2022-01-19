import { ValueProperty } from "@/Core/Property/Base/ValueProperty";
import { IPropertyParams } from "@/Core/Property/Base/IPropertyParams";
import { BandPosition } from "@/Core/Enums/BandPosition";

export class BandPositionProperty extends ValueProperty<BandPosition> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<BandPosition>) {
    super(params);
    this.options = Object(BandPosition);
  }
}
