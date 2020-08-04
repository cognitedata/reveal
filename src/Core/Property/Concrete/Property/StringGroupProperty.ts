import { PropertyType } from "@/Core/Enums/PropertyType";
import Property from "@/Core/Property/Base/Property";

export default class StringGroupProperty extends Property
{
  //==================================================
  // OVERRIDDEN BaseProperty FIELDS
  //==================================================

  protected _type = PropertyType.StringGroup;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string, readonly?: boolean)
  {
    super(name, readonly);
  }
}
