import { cloneDeep } from 'lodash';
import { PrimitiveRenderStyle } from '../common/PrimitiveRenderStyle';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';

export class LineRenderStyle extends PrimitiveRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public pipeRadius = 0.02;
  public selectedPipeRadius = this.pipeRadius * 2;
  public lineWidth = 1;
  public selectedLineWidth = this.lineWidth * 2;
  public transparent = false;
  public renderOrder?: number = undefined;

  // Solid
  public showSolid = false;
  public solidOpacityUse = true;
  public selectedSolidOpacity = 0.5;
  public solidOpacity = this.selectedSolidOpacity / 2;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<LineRenderStyle>(this);
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
}
