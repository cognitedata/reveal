import UseProperty from "@/Core/Property/Base/UseProperty";
import { PropertyType } from "@/Core/Enums/PropertyType";
import { Action, Retrieve } from "@/Core/Property/Base/BaseProperty";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import { Range1 } from "@/Core/Geometry/Range1";

export default class ColorMapProperty extends UseProperty<string>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string, value: string | Retrieve<string>, readonly?: boolean, instance?: any,
    applyDelegate?: Action<void>, valueDelegate?: Action<string>, options?: string[])
  {
    super(name, value, readonly, instance, applyDelegate, valueDelegate, options);
  }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.ColorMap; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getColorMapOptionColors(valuesPerColorMap: number): string[][]
  {
    return this.legalValues.map(colorMapName =>
    {
      const colorMap = ColorMaps.get(colorMapName);
      const colors: string[] = [];
      if (!colorMap)
        return colors;
      const range = new Range1(0, valuesPerColorMap - 1);
      for (let i = 0; i < valuesPerColorMap; i++)
      {
        const fraction = range.getFraction(i);
        const color = colorMap.getColor(fraction).hex();
        colors.push(color);
      }
      return colors;
    });
  }
}
