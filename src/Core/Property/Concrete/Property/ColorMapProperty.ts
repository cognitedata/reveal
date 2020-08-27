import ValueProperty from "@/Core/Property/Base/ValueProperty";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import Range1 from "@/Core/Geometry/Range1";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

export default class ColorMapProperty extends ValueProperty<string>
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(params: IPropertyParams<string>) { super(params); }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getColorMapOptionColors(colorCount: number): string[][]
  {
    if (!this.options || !this.options.length)
      return [];

    return (this.options as string[]).map(colorMapName =>
    {
      const colorMap = ColorMaps.get(colorMapName);
      const colors: string[] = [];
      if (!colorMap)
        return colors;
        
      const range = new Range1(0, colorCount - 1);
      for (let i = 0; i < colorCount; i++)
      {
        const fraction = range.getFraction(i);
        const color = colorMap.getColor(fraction).hex();
        colors.push(color);
      }
      return colors;
    });
  }
}
