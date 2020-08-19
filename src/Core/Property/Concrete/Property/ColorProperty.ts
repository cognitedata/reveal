import { PropertyType } from "@/Core/Enums/PropertyType";
import Color from "color";
import UseProperty from "@/Core/Property/Base/UseProperty";
import { Action, Retrieve } from "@/Core/Property/Base/BaseProperty";

export default class ColorProperty extends UseProperty<Color>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string, value: Color | Retrieve<Color>, readonly?: boolean, instance?: any,
    applyDelegate?: Action<void>, valueDelegate?: Action<Color>)
  {
    super(name, value, readonly, instance, applyDelegate, valueDelegate);
  }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.Color; }
}
