import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { Vector3 } from 'three';
import { Range3 } from '../../base/utilities/geometry/Range3';
import { createFractalRegularGrid2 } from './geometry/createFractalRegularGrid2';
import { TerrainDomainObject } from './TerrainDomainObject';
import { type TranslationInput } from '../../base/utilities/translation/TranslateInput';
import { type IconName } from '../../base/utilities/types';
import { Random } from '../../base/utilities/misc/Random';

export class SetTerrainVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'EyeShow';
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Set terrain visible. Create it if not done' };
  }

  protected override invokeCore(): boolean {
    const { renderTarget, rootDomainObject } = this;
    let terrainDomainObject = rootDomainObject.getDescendantByType(TerrainDomainObject);
    const random = new Random(42);
    if (terrainDomainObject === undefined) {
      terrainDomainObject = new TerrainDomainObject();
      const range = new Range3(new Vector3(0, 0, 0), new Vector3(1000, 1000, 200));
      terrainDomainObject.grid = createFractalRegularGrid2(range, random);

      rootDomainObject.addChildInteractive(terrainDomainObject);
      terrainDomainObject.setVisibleInteractive(true, renderTarget);
    } else {
      terrainDomainObject.toggleVisibleInteractive(renderTarget);
    }
    return true;
  }
}
