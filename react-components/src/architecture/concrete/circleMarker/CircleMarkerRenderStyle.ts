import { BLACK_COLOR } from '../../base/utilities/colors/colorUtils';
import { cloneDeep } from 'lodash-es';
import { CommonRenderStyle } from '../../base/renderStyles/CommonRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type Color } from 'three';

export class CircleMarkerRenderStyle extends CommonRenderStyle {
  public solidOpacity = 0.25;
  public lineWidth = 2;
  public maxDistanceForSizeAdjustments?: number; // undefined or greater than 0
  public readonly lineColor: Color = BLACK_COLOR.clone();

  constructor() {
    super();
    this.depthTest = false;
  }

  public override clone(): RenderStyle {
    return cloneDeep<CircleMarkerRenderStyle>(this);
  }
}
