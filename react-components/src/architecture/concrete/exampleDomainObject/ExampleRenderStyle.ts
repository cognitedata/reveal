/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { DepthTestRenderStyle } from '../primitives/DepthTestRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export class ExampleRenderStyle extends DepthTestRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public radius = 1;
  public opacity = 0.75;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<ExampleRenderStyle>(this);
  }
}
