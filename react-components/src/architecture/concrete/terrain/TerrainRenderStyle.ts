import { cloneDeep } from 'lodash-es';
import { ColorType } from '../../base/domainObjectsHelpers/ColorType';
import { RenderStyle } from '../../base/renderStyles/RenderStyle';
import { ColorMapType } from '../../base/utilities/colors/ColorMapType';

export class TerrainRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public showContours = true;
  public contoursColorType: ColorType = ColorType.Black;

  public showSolid = true;
  public solidColorType: ColorType = ColorType.ColorMap;
  public solidColorMapType: ColorMapType = ColorMapType.Rainbow;

  public solidContourVolume = 0.5;
  public solidContourUse = true;

  public solidShininess = 0.03;
  public solidShininessUse = true;

  public solidOpacity = 0.5;
  public solidOpacityUse = false;

  public increment = 0;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<TerrainRenderStyle>(this);
  }
}
