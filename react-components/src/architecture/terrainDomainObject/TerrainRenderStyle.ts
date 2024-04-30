/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { ColorType } from '../utilities/colors/ColorType';
import { RenderStyle } from '../utilities/misc/RenderStyle';
import { ColorMapType } from '../utilities/colors/ColorMapType';

export class TerrainRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public showContours = true;
  public contoursColorType = ColorType.Black;

  public showSolid = true;
  public solidColorType = ColorType.ColorMap;
  public solidColorMapType = ColorMapType.Terrain;

  public solidContourVolume = 0.5;
  public solidContourUse = true;

  public solidShininess = 0.03;
  public solidShininessUse = true;

  public solidOpacity = 0.5;
  public solidOpacityUse = false;

  public increment = 10;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<TerrainRenderStyle>(this);
  }
}
