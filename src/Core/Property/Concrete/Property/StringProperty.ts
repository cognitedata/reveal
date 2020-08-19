import { PropertyType } from "@/Core/Enums/PropertyType";
import { Action, Retrieve } from "@/Core/Property/Base/BaseProperty";
import UseProperty from '@/Core/Property/Base/UseProperty';

export default class StringProperty extends UseProperty<string>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string, value: string | Retrieve<string>, readonly?: boolean, instance?: any,
    applyDelegate?: Action<void>, valueDelegate?: Action<string>)
  {
    super(name, value, readonly, instance, applyDelegate, valueDelegate);
  }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.String; }

}
