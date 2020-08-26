import ValueProperty from "@/Core/Property/Base/ValueProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

export default class StringProperty extends ValueProperty<string>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<string>) { super(params); }

}
