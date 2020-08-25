import { PropertyType } from "@/Core/Enums/PropertyType";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";

export default class GroupProperty extends BasePropertyFolder
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string) { super(name); }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.Group; }
}
