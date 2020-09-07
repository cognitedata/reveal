import { ValueProperty } from "@/Core/Property/Base/ValueProperty";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import { Range1 } from "@/Core/Geometry/Range1";
import { IPropertyParams } from "@/Core/Property/Base/IPropertyParams";
import { Appearance } from "@/Core/States/Appearance";
import { IPropertyExtraOptionDataParams } from "@/Core/Property/Base/IPropertyExtraOptionDataParms";

export class ColorMapProperty extends ValueProperty<string>
{
  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(params: IPropertyParams<string>)
  {
    super(params);
    this.options = ColorMaps.getOptions();
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getColorMapOptionColors(colorCount: number): IPropertyExtraOptionDataParams[] | null
  {
    const options = this.getExpandedOptions() as string[];
    if (!options.length)
      return null;

    return (options as string[]).map(colorMapName =>
    {
      const colorMapOptionData = { colorMapColors: [] as string[] };
      const colorMap = ColorMaps.get(colorMapName);
      if (!colorMap)
        return colorMapOptionData;
        
      const range = new Range1(0, colorCount - 1);
      for (let i = 0; i < colorCount; i++)
      {
        const fraction = range.getFraction(i);
        const color = colorMap.getColor(fraction).hex();
        colorMapOptionData.colorMapColors.push(color);
      }
      return colorMapOptionData;
    });
  }

  //==================================================
  // OVERRIDES OF VALUE PROPERTY
  //==================================================

  public extraOptionsData(): IPropertyExtraOptionDataParams[] | null 
  {
    return this.getColorMapOptionColors(Appearance.valuesPerColorMap);
  }
}
