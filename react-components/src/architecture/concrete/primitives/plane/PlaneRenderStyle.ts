/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { type RenderStyle } from '../../../base/domainObjectsHelpers/RenderStyle';
import { DepthTestRenderStyle } from '../DepthTestRenderStyle';

export class PlaneRenderStyle extends DepthTestRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public opacity = 0.5;
  public selectedOpacity = 0.8;
  public opacityUse = true;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<PlaneRenderStyle>(this);
  }
}
