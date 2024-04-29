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
import { TERRAIN_NAME } from './SetTerrainVisibleCommand';
import { Changes } from '../utilities/misc/Changes';

export class UpdateTerrainCommand extends RenderTargetCommand {
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
    return 'ChangeTerrain';
  }

  public override get icon(): string {
    return 'Refresh';
  }

  public override get tooltip(): string {
    return 'Change the visible terrain';
  }

  public override get tooltipKey(): string {
    return 'NAVIGATION';
  }

  public get isEnabled(): boolean {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;
    const surfaceDomainObject = rootDomainObject.getDescendantByTypeAndName(
      SurfaceDomainObject,
      TERRAIN_NAME
    );
    if (surfaceDomainObject === undefined) {
      return false;
    }
    return surfaceDomainObject.isVisible(renderTarget);
  }

  protected invokeCore(): boolean {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const surfaceDomainObject = rootDomainObject.getDescendantByTypeAndName(
      SurfaceDomainObject,
      TERRAIN_NAME
    );
    if (surfaceDomainObject === undefined) {
      return false;
    }
    if (!surfaceDomainObject.isVisible(renderTarget)) {
      return false;
    }
    const range = new Range3(new Vector3(0, 0, 0), new Vector3(1000, 1000, 200));
    surfaceDomainObject.surface = createFractalRegularGrid2(range);
    surfaceDomainObject.notify(Changes.geometry);
    return true;
  }
}
