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

  // Solid
  public showSolid = true;
  public solidOpacityUse = true;
  public selectedSolidOpacity = 0.5;
  public solidOpacity = this.selectedSolidOpacity / 4;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<SolidPrimitiveRenderStyle>(this);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getSolidOpacity(isSelected: boolean): number {
    if (!this.solidOpacityUse) {
      return 1;
    }
    return isSelected ? this.selectedSolidOpacity : this.solidOpacity;
  }

  public getLineWidth(isSelected: boolean): number {
    return isSelected ? this.selectedLineWidth : this.lineWidth;
  }

  public getLineColor(isSelected: boolean): Color {
    return isSelected ? this.selectedLineColor : this.lineColor;
  }
}
