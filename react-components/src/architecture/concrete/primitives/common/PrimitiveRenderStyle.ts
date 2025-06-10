import { ColorType } from '../../../base/domainObjectsHelpers/ColorType';
import { Color } from 'three';
import { WHITE_COLOR } from '../../../base/utilities/colors/colorExtensions';
import { CommonRenderStyle } from '../../../base/renderStyles/CommonRenderStyle';

export abstract class PrimitiveRenderStyle extends CommonRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  // For the object itself
  public colorType = ColorType.Specified;

  // For labels only
  public showLabel = true;
  public addLabels: boolean = true;
  public labelColor = WHITE_COLOR.clone();
  public labelBgColor = new Color('#232323');
  public labelOpacity = 0.9;
  public relativeTextSize = 0.05; // Relative to diagonal of the object for box and average of length of line segments for line
}
