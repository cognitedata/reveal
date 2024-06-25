/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { PrimitiveRenderStyle } from '../PrimitiveRenderStyle';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';

export class BoxRenderStyle extends PrimitiveRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public showLines = true;
  public showSolid = true;

  public opacity = 0.5;
  public opacityUse = true;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<BoxRenderStyle>(this);
  }
}
