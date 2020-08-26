import ValueProperty from "@/Core/Property/Base/ValueProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

export default class BooleanProperty extends ValueProperty<boolean>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<boolean>) { super(params); }
}
