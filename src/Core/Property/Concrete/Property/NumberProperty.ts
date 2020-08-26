import ValueProperty from "@/Core/Property/Base/ValueProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

export class NumberProperty extends ValueProperty<number>
{ 
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<number>) { super(params); }
}