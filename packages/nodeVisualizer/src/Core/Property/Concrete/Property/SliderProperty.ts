import { ValueProperty } from "@/Core/Property/Base/ValueProperty";
import { IPropertyParams } from "@/Core/Property/Base/IPropertyParams";

// It goes from 0 to 1

export class SliderProperty extends ValueProperty<number> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<number>) {
    super(params);
  }
}
