import { PropertyType } from "@/Core/Enums/PropertyType";
import UseProperty from "@/Core/Property/Base/UseProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

export abstract class SelectProperty<T> extends UseProperty<T>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<T>)
  {
    super(params);
  }
  
  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.Select; }
}
