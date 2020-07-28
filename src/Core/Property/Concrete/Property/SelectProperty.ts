import { PropertyType } from "@/Core/Enums/PropertyType";
import UsePropertyT from "@/Core/Property/Base/UsePropertyT";

export class SelectProperty extends UsePropertyT<string>
{

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  protected _type = PropertyType.Select;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public addOption(name: string): void
  {
    if (!this.hasLegalValues)
      this.setLegalValues([]);

    this.getLegalValues().push(name);
  }
}
