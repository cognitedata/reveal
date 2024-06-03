/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { MeasureRenderStyle } from './MeasureRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export class MeasureLineRenderStyle extends MeasureRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public pipeRadius = 0.02;
  public selectedPipeRadius = this.pipeRadius * 2;
  public lineWidth = 1;
  public selectedLineWidth = this.lineWidth * 2;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<MeasureLineRenderStyle>(this);
  }
}
