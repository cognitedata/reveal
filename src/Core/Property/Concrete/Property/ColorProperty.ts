import UsePropertyT from "../../Base/UsePropertyT";
import { PropertyType } from "@/Core/Enums/PropertyType";
import { Action, Retrieve } from "../../Base/BaseProperty";
import Color from "color";

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
