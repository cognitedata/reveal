/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { Vector3 } from 'three';
import { Range3 } from '../../base/utilities/geometry/Range3';
import { createFractalRegularGrid2 } from './geometry/createFractalRegularGrid2';
import { TerrainDomainObject } from './TerrainDomainObject';
import { type TranslateKey } from '../../base/utilities/TranslateKey';

export class SetTerrainVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Set terrain visible. Create it if not done' };
  }

  protected override invokeCore(): boolean {
    const { renderTarget, rootDomainObject } = this;
    let terrainDomainObject = rootDomainObject.getDescendantByType(TerrainDomainObject);
    if (terrainDomainObject === undefined) {
      terrainDomainObject = new TerrainDomainObject();
      const range = new Range3(new Vector3(0, 0, 0), new Vector3(1000, 1000, 200));
      terrainDomainObject.grid = createFractalRegularGrid2(range);

      rootDomainObject.addChildInteractive(terrainDomainObject);
      terrainDomainObject.setVisibleInteractive(true, renderTarget);
    } else {
      terrainDomainObject.toggleVisibleInteractive(renderTarget);
    }
    return true;
  }
}
