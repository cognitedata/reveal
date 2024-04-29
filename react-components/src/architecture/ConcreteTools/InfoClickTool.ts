/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { NavigationTool } from './NavigationTool';

export class InfoClickTool extends NavigationTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(target: RevealRenderTarget) {
    super(target);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get shortCutKey(): string | undefined {
    return 'I';
  }

  public override get name(): string {
    return 'Info';
  }

  public override get icon(): string {
    return 'Info';
  }

  public override get tooltip(): string {
    return 'Info';
  }

  public override get tooltipKey(): string {
    return 'INFO';
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const viewer = this.renderTarget.viewer;

    const intersection = await viewer.getIntersectionFromPixel(event.offsetX, event.offsetY);
    if (intersection === null) {
      return;
    }
    alert('Click on object' + intersection.type);
  }
}
