import { PropertyType } from "@/Core/Enums/PropertyType";
import Color from "color";
import UsePropertyT from "@/Core/Property/Base/UsePropertyT";
import { Action, Retrieve } from "@/Core/Property/Base/BaseProperty";

export default class ColorProperty extends UsePropertyT<Color>
{
  //==================================================
  // OVERRRIDDEN BaseProperty FIELDS
  //==================================================

  protected _type = PropertyType.Color;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string, value: Color | Retrieve<Color>, readonly?: boolean, instance?: any,
    applyDelegate?: Action<void>, valueDelegate?: Action<Color>)
  {
    super(name, value, readonly, instance, applyDelegate, valueDelegate);
  }
}
