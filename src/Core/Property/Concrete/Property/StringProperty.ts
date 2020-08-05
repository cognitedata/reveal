import { PropertyType } from "@/Core/Enums/PropertyType";
import UsePropertyT from "@/Core/Property/Base/UsePropertyT";
import {Action, Retrieve} from "@/Core/Property/Base/BaseProperty";

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
