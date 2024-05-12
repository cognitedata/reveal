/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { Color } from 'three';
import { getMixedColor } from '../../base/utilities/colors/colorExtensions';

const COLOR_WHITE = new Color().setScalar(1);
const COLOR_DARK_GREY = new Color().setScalar(0.23);
const COLOR_LIGHT_GREY = new Color().setScalar(0.35);
const COLOR_RED = new Color(1, 0, 0);
const COLOR_GREEN = new Color(0, 1, 0);
const COLOR_BLUE = new Color(0, 0, 1);

export class AxisRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public showAxis = true;
  public showAxisLabel = true;
  public showAxisNumbers = true;
  public showAxisTicks = true;
  public showGrid = true;

  public numberOfTicks = 30; // Appoximately number of ticks for the largest axis
  public tickLength = 0.005; // In fraction of the bounding box diagonal
  public tickFontSize = 2; // In fraction of the real tickLength
  public axisLabelFontSize = 4; // In fraction of the real tickLength

  public gridColor = COLOR_LIGHT_GREY;
  public wallColor = COLOR_DARK_GREY;
  public textColor = COLOR_WHITE;

  public axisColor = COLOR_WHITE;
  public xAxisColor = COLOR_RED;
  public yAxisColor = COLOR_GREEN;
  public zAxisColor = COLOR_BLUE;
  public axisBlend = 0.6;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<AxisRenderStyle>(this);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getAxisColor(isMainAxis: boolean, dimension: number): Color {
    if (!isMainAxis) {
      return this.axisColor;
    }
    // Note: Y is up in viewer coordinated
    switch (dimension) {
      case 0:
        return getMixedColor(this.axisColor, this.xAxisColor, this.axisBlend);
      case 1:
        return getMixedColor(this.axisColor, this.zAxisColor, this.axisBlend);
      case 2:
        return getMixedColor(this.axisColor, this.yAxisColor, this.axisBlend);
      default:
        throw Error('getAxisColor');
    }
  }

  public getAxisLabel(dimension: number): string {
    // Note: Y is up in viewer coordinated
    switch (dimension) {
      case 0:
        return 'X';
      case 1:
        return 'Z';
      case 2:
        return 'Y';
      default:
        throw Error('getAxisName');
    }
  }
}
