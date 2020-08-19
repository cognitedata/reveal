import { PropertyType } from "@/Core/Enums/PropertyType";
import Color from "color";
import UseProperty from "@/Core/Property/Base/UseProperty";
import IPropertyParams from '@/Core/Property/Base/IPropertyParams';

export default class ColorProperty extends UseProperty<Color>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<Color>) { super(params); }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.Color; }
}
