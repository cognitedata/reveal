import UsePropertyT from "../../Base/UsePropertyT";
import { PropertyType } from "@/Core/Enums/PropertyType";
import { Action, Retrieve } from "../../Base/BaseProperty";

export default class StringProperty extends UsePropertyT<string>
{
  //==================================================
  // OVERRRIDDEN BaseProperty FIELDS
  //==================================================

  protected _type = PropertyType.String;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string, value: string | Retrieve<string>, readonly?: boolean, instance?: any,
                     applyDelegate?: Action<void>, valueDelegate?: Action<string>)
  {
    super(name, value, readonly, instance, applyDelegate, valueDelegate);
  }
}
