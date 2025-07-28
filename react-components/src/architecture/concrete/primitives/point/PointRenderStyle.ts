import { cloneDeep } from 'lodash';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';

export class PointRenderStyle extends SolidPrimitiveRenderStyle {
  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<PointRenderStyle>(this);
  }
}
