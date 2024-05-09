/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { ColorType } from '../../base/domainObjectsHelpers/ColorType';
import { RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export class BoxRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public colorType = ColorType.Specified;
  public opacity = 0.5;
  public opacityUse = true;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<BoxRenderStyle>(this);
  }
}
