/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { ColorType } from '../utilities/colors/ColorType';
import { RenderStyle } from '../utilities/misc/RenderStyle';

export class BoxRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public colorType = ColorType.Specified;
  public opacity = 0.8;
  public opacityUse = true;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<BoxRenderStyle>(this);
  }
}
