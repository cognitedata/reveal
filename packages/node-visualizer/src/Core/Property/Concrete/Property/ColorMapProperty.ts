import { Range1 } from '../../../Geometry/Range1';
import { ColorMaps } from '../../../Primitives/ColorMaps';
import { IPropertyExtraOptionDataParams } from '../../../Property/Base/IPropertyExtraOptionDataParms';
import { IPropertyParams } from '../../../Property/Base/IPropertyParams';
import { ValueProperty } from '../../../Property/Base/ValueProperty';
import { Appearance } from '../../../States/Appearance';

export class ColorMapProperty extends ValueProperty<string> {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<string>) {
    super(params);
    this.options = ColorMaps.getOptions();
  }

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public getColorMapOptionColors(
    colorCount: number
  ): IPropertyExtraOptionDataParams[] | null {
    const options = this.getExpandedOptions() as string[];
    if (!options.length) return null;

    return (options as string[]).map((colorMapName) => {
      const colorMapOptionData = { colorMapColors: [] as string[] };
      const colorMap = ColorMaps.get(colorMapName);
      if (!colorMap) return colorMapOptionData;

      const range = new Range1(0, colorCount - 1);
      for (let i = 0; i < colorCount; i++) {
        const fraction = range.getFraction(i);
        const color = colorMap.getColor(fraction).hex();
        colorMapOptionData.colorMapColors.push(color);
      }
      return colorMapOptionData;
    });
  }

  //= =================================================
  // OVERRIDES OF VALUE PROPERTY
  //= =================================================

  public extraOptionsData(): IPropertyExtraOptionDataParams[] | null {
    return this.getColorMapOptionColors(Appearance.valuesPerColorMap);
  }
}
