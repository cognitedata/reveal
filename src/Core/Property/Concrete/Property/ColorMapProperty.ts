import UsePropertyT from "@/Core/Property/Base/UsePropertyT";
import { PropertyType } from "@/Core/Enums/PropertyType";
import { Action, Retrieve } from "@/Core/Property/Base/BaseProperty";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import { Range1 } from "@/Core/Geometry/Range1";

export default class ColorMapProperty extends UsePropertyT<string>
{
  //==================================================
  // OVERRIDDEN BaseProperty FIELDS
  //==================================================

  protected _type = PropertyType.ColorMap;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string, value: string | Retrieve<string>, readonly?: boolean, instance?: any,
    applyDelegate?: Action<void>, valueDelegate?: Action<string>, options?: string[])
  {
    super(name, value, readonly, instance, applyDelegate, valueDelegate, options);
  }

  public getColorMapOptionColors(valuesPerColorMap: number): string[][]
  {
    return this.getLegalValues().map(colorMapName =>
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
