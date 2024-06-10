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

  public depthTest = true;
  public colorType = ColorType.Specified;
  public textColor = WHITE_COLOR.clone();
  public textBgColor = new Color('#232323');
  public textOpacity = 0.9;
  public relativeTextSize = 0.05; // Relative to diagonal of the measurement object for box and average of lenght of line segments for line
}
