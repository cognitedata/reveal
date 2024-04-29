/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { Vector3 } from 'three';
import { Range3 } from '../utilities/geometry/Range3';
import { createFractalRegularGrid2 } from '../utilities/geometry/createFractalRegularGrid2';
import { SurfaceDomainObject } from '../surfaceDomainObject/SurfaceDomainObject';

export const TERRAIN_NAME = 'TERRAIN';

export class SetTerrainVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(target: RevealRenderTarget) {
    super(target);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get name(): string {
    return 'SetTerrainVisible';
  }

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get tooltip(): string {
    return 'Set terrain visible. Create it if not done';
  }

  public override get tooltipKey(): string {
    return 'NAVIGATION';
  }

  protected invokeCore(): boolean {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    let surfaceDomainObject = rootDomainObject.getDescendantByTypeAndName(
      SurfaceDomainObject,
      TERRAIN_NAME
    );
    if (surfaceDomainObject === undefined) {
      surfaceDomainObject = new SurfaceDomainObject();
      const range = new Range3(new Vector3(0, 0, 0), new Vector3(1000, 1000, 200));
      surfaceDomainObject.surface = createFractalRegularGrid2(range);
      surfaceDomainObject.name = TERRAIN_NAME;

      rootDomainObject.addChildInteractive(surfaceDomainObject);
      surfaceDomainObject.setVisibleInteractive(true, renderTarget);
    } else {
      surfaceDomainObject.toggleVisibleInteractive(renderTarget);
    }
    renderTarget.updateToolsAndCommands();
    return true;
  }
}
