/*!
 * Copyright 2024 Cognite AS
 */
import { RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export class PointRenderStyle extends RenderStyle {
  public override clone(): RenderStyle {
    throw new Error('Method not implemented.');
  }

  public radius: number;
  public opacity: number;
  public depthTest: boolean;

  constructor() {
    super();

    this.radius = 1;
    this.opacity = 0.5;
    this.depthTest = true;
  }
}
