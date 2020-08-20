import { PropertyType } from "@/Core/Enums/PropertyType";
import UseProperty from "@/Core/Property/Base/UseProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

export default class StringProperty extends UseProperty<string>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<string>) { super(params); }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.String; }
}
