import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { Vector3 } from 'three';
import { Range3 } from '../../base/utilities/geometry/Range3';
import { createFractalRegularGrid2 } from './geometry/createFractalRegularGrid2';
import { TerrainDomainObject } from './TerrainDomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type TranslationInput } from '../../base/utilities/translation/TranslateInput';
import { type IconName } from '../../base/utilities/types';
import { Random } from '../../base/utilities/misc/Random';

export class UpdateTerrainCommand extends RenderTargetCommand {
  private readonly _random = new Random(42);

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'Sync';
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Change the visible terrain' };
  }

  public override get isEnabled(): boolean {
    const { renderTarget, rootDomainObject } = this;
    const terrainDomainObject = rootDomainObject.getDescendantByType(TerrainDomainObject);
    if (terrainDomainObject === undefined) {
      return false;
    }
    return terrainDomainObject.isVisible(renderTarget);
  }

  protected override invokeCore(): boolean {
    const { renderTarget, rootDomainObject } = this;
    const terrainDomainObject = rootDomainObject.getDescendantByType(TerrainDomainObject);
    if (terrainDomainObject === undefined) {
      return false;
    }
    if (!terrainDomainObject.isVisible(renderTarget)) {
      return false;
    }
    const range = new Range3(new Vector3(0, 0, 0), new Vector3(1000, 1000, 200));
    terrainDomainObject.grid = createFractalRegularGrid2(range, this._random);
    terrainDomainObject.notify(Changes.geometry);
    return true;
  }
}
