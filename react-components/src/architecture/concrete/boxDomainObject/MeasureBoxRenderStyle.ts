/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { MeasureRenderStyle } from './MeasureRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export class MeasureBoxRenderStyle extends MeasureRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public opacity = 0.5;
  public opacityUse = true;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<MeasureBoxRenderStyle>(this);
  }
}
