/*!
 * Copyright 2024 Cognite AS
 */

import { RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export abstract class DepthTestRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public depthTest = true;
}
