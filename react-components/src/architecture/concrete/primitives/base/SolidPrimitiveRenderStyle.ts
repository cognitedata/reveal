/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { PrimitiveRenderStyle } from './PrimitiveRenderStyle';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { BLACK_COLOR, WHITE_COLOR } from '../../../base/utilities/colors/colorExtensions';
import { type Color } from 'three';

export class SolidPrimitiveRenderStyle extends PrimitiveRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public showLines = true;
  public lineWidth = 1;
  public selectedLineWidth = 1;

  // Line colors are not always used, often the domain object color is used
  public lineColor = BLACK_COLOR.clone();
  public selectedLineColor = WHITE_COLOR.clone();

  public showSolid = true;
  public opacityUse = true;
  public selectedOpacity = 0.5;
  public opacity = this.selectedOpacity / 4;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<SolidPrimitiveRenderStyle>(this);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getOpacity(isSelected: boolean): number {
    if (!this.opacityUse) {
      return 1;
    }
    return isSelected ? this.selectedOpacity : this.opacity;
  }

  public getLineWidth(isSelected: boolean): number {
    return isSelected ? this.selectedLineWidth : this.lineWidth;
  }

  public getLineColor(isSelected: boolean): Color {
    return isSelected ? this.selectedLineColor : this.lineColor;
  }
}
