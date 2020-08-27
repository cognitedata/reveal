import { ColorType } from "@/Core/Enums/ColorType";
import ValueProperty from "@/Core/Property/Base/ValueProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

export class ColorTypeProperty extends ValueProperty<ColorType>
{
  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(params: IPropertyParams<ColorType>) 
  {
    super(params);
    this.options = Object(ColorType);
  }

  //==================================================
  // OVERRIDES of ValueProperty
  //==================================================

  public /*overrides*/ getOptionIcon(option: ColorType): string
  {
    switch (option)
    {
      case ColorType.Black:
      default: return "";
    }
  }
}
