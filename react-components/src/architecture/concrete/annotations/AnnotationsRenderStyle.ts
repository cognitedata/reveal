/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { CommonRenderStyle } from '../../base/renderStyles/CommonRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { Status } from './AnnotationsView';

export class AnnotationsRenderStyle extends CommonRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public contextualizedColor = 0xd46ae2; // magenta
  public suggestedColor = 0xffff00; // yellow
  public approvedColor = 0x00ff00; // green
  public rejectedColor = 0xff0000; // red
  public pendingColor = 0x4da6ff; // light blue
  public hoveredColor = 0xffff00; // yellow
  public blankColor = 0xffffff; // white
  public blankOpacity = 0.4;
  public lineWidth = 2;
  public selectedLineWidth = 2;
  public pendingLineWidth = 6;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<AnnotationsRenderStyle>(this);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getColorByStatus(status: Status): number {
    switch (status) {
      case Status.Contextualized:
        return this.contextualizedColor;
      case Status.Approved:
        return this.approvedColor;
      case Status.Suggested:
        return this.suggestedColor;
      default:
        return this.rejectedColor;
    }
  }
}
