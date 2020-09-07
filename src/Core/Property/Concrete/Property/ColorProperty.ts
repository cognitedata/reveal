import Color from "color";
import { ValueProperty } from "@/Core/Property/Base/ValueProperty";
import { IPropertyParams } from "@/Core/Property/Base/IPropertyParams";

export class ColorProperty extends ValueProperty<Color>
{
  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(params: IPropertyParams<Color>) { super(params); }
}
