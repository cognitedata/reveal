import Color from 'color';

import ColorPnG from '../../../../images/ColorTypes/Color.png';
import ColorMap from '../../../../images/ColorTypes/ColorMap.png';
import Different from '../../../../images/ColorTypes/Different.png';
import Folder from '../../../../images/ColorTypes/Folder.png';
import { ColorType } from '../../../Enums/ColorType';
import {
  ColorTypeIconParams,
  IPropertyExtraOptionDataParams,
} from '../../Base/IPropertyExtraOptionDataParms';
import { IPropertyParams } from '../../Base/IPropertyParams';
import { ValueProperty, ExpandedOption } from '../../Base/ValueProperty';

export class ColorTypeProperty extends ValueProperty<ColorType> {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private _nodeColor?: Color;

  private _parentNodeColor?: Color;

  public solid = false;

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(params: IPropertyParams<ColorType>, nodeColor?: Color) {
    super(params);
    this.options = Object(ColorType);
    this._nodeColor = nodeColor;
  }

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get nodeColor(): Color | undefined {
    return this._nodeColor;
  }

  public set nodeColor(color: Color | undefined) {
    this._nodeColor = color;
  }

  public get parentNodeColor(): Color | undefined {
    return this._parentNodeColor;
  }

  public set parentNodeColor(color: Color | undefined) {
    this._parentNodeColor = color;
  }

  //= =================================================
  // OVERRIDES of ValueProperty
  //= =================================================

  public /* overrides */ getColorTypeOptionIcons():
    | IPropertyExtraOptionDataParams[]
    | null {
    const options = this.getExpandedOptions() as [string, ColorType][];
    if (!options.length) return null;

    return options.map((colorTypeOption) => {
      const value = colorTypeOption[ExpandedOption.Value];
      let colorTypeIconData: ColorTypeIconParams = {};

      switch (value) {
        case ColorType.Black:
          colorTypeIconData = { icon: ColorPnG, color: '#000000' };
          break;
        case ColorType.White:
          colorTypeIconData = { icon: ColorPnG, color: '#FFFFFF' };
          break;
        case ColorType.Specified:
          colorTypeIconData = {
            icon: ColorPnG,
            color: this.nodeColor?.hex() || '',
          };
          break;
        case ColorType.ColorMap:
          colorTypeIconData = { icon: ColorMap };
          break;
        case ColorType.Different:
          colorTypeIconData = { icon: Different };
          break;
        case ColorType.Parent:
          colorTypeIconData = {
            icon: Folder,
            color: this.parentNodeColor?.hex() || '',
          };
          break;
        default:
          colorTypeIconData = {};
      }

      return { colorTypeIconData };
    });
  }

  //= =================================================
  // OVERRIDES OF VALUE PROPERTY
  //= =================================================

  public extraOptionsData(): IPropertyExtraOptionDataParams[] | null {
    return this.getColorTypeOptionIcons();
  }
}
