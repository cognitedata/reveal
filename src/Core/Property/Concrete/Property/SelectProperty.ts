import { PropertyType } from "@/Core/Enums/PropertyType";
import UseProperty from "@/Core/Property/Base/UseProperty";

export class SelectProperty extends UseProperty<string>
{
  //==================================================
  // INSTANCE METHODS
  //==================================================

  public addOption(name: string): void
  {
    if (!this.options)
      this.options = [];
    this.options.push(name);
  }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.Select; }
}
