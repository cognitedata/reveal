import ValueProperty from "@/Core/Property/Base/ValueProperty";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import Range1 from "@/Core/Geometry/Range1";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";
import { Appearance } from "@/Core/States/Appearance";

export default class ColorMapProperty extends ValueProperty<string>
{
  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(params: IPropertyParams<string>)
  {
    super(params);
    this.options = ColorMaps.getOptions();
    this.extraOptionsData = this.getColorMapOptionColors(Appearance.valuesPerColorMap);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getColorMapOptionColors(colorCount: number): string[][]
  {
    const options = this.getExpandedOptions() as string[];
    if (!options.length)
      return [];

    return (options as string[]).map(colorMapName =>
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
