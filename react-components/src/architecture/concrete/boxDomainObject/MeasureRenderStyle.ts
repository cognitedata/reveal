/*!
 * Copyright 2024 Cognite AS
 */

import { ColorType } from '../../base/domainObjectsHelpers/ColorType';
import { RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { Color } from 'three';
import { WHITE_COLOR } from '../../base/utilities/colors/colorExtensions';

export abstract class MeasureRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public depthTest = false;
  public colorType = ColorType.Specified;
  public textColor = WHITE_COLOR.clone();
  public textBgColor = new Color().setScalar(0.05); // Dark gray
  public relativeTextSize = 0.05; // Relative to diagonal of the box
}
