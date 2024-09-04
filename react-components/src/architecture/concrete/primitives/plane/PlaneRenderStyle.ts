/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { BLACK_COLOR, WHITE_COLOR } from '../../../base/utilities/colors/colorExtensions';
import { SolidPrimitiveRenderStyle } from '../base/SolidPrimitiveRenderStyle';

export class PlaneRenderStyle extends SolidPrimitiveRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public linesColor = BLACK_COLOR.clone();
  public selectedLinesColor = WHITE_COLOR.clone();
  public selectedOpacity = 0.5;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.opacity = 0.25;
  }

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<PlaneRenderStyle>(this);
  }
}
