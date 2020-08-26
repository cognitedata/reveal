import { PropertyType } from "@/Core/Enums/PropertyType";
import UseProperty from "@/Core/Property/Base/UseProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

// It goes from 0 to 1

export class SliderProperty extends UseProperty<number>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<number>)
  {
    super(params);
  }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.Slider; }
}
