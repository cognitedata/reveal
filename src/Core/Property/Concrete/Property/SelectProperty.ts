import { PropertyType } from "@/Core/Enums/PropertyType";
import UseProperty from "@/Core/Property/Base/UseProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

export abstract class SelectProperty<U> extends UseProperty<U>
{
  //==================================================
  // INSTANCE METHODS
  //==================================================

  public addOption(option: U): void
  {
    if (!this.options)
      this.options = [];
    this.options.push(option);
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<U>)
  {
    super(params);
  }
  
  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.Select; }
}
