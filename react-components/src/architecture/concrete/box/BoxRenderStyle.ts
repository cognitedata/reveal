/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { TextRenderStyle } from './TextRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export class BoxRenderStyle extends TextRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public opacity = 0.5;
  public opacityUse = true;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<BoxRenderStyle>(this);
  }
}
