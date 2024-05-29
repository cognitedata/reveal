/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export class ExampleRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public radius = 1;
  public opacity = 0.5;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<ExampleRenderStyle>(this);
  }
}
