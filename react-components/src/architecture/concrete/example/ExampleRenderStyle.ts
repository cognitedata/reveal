import { cloneDeep } from 'lodash';
import { CommonRenderStyle } from '../../base/renderStyles/CommonRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';

export class ExampleRenderStyle extends CommonRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public radius = 1;
  public opacity = 0.75;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<ExampleRenderStyle>(this);
  }
}
