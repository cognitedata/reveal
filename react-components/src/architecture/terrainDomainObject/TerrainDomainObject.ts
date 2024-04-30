/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../domainObjects/VisualDomainObject';
import { TerrainRenderStyle } from './TerrainRenderStyle';
import { type RegularGrid2 } from '../utilities/geometry/RegularGrid2';
import { type RenderStyle } from '../utilities/misc/RenderStyle';
import { type ThreeView } from '../views/ThreeView';
import { TerrainThreeView } from './TerrainThreeView';

export const DEFAULT_TERRAIN_NAME = 'Terrain';

export class TerrainDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _grid: RegularGrid2 | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get grid(): RegularGrid2 | undefined {
    return this._grid;
  }

  public set grid(value: RegularGrid2 | undefined) {
    this._grid = value;
  }

  public get renderStyle(): TerrainRenderStyle | undefined {
    return this.getRenderStyle() as TerrainRenderStyle;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public override get typeName(): string {
    return DEFAULT_TERRAIN_NAME;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new TerrainRenderStyle();
  }

  public override verifyRenderStyle(style: RenderStyle): void {
    if (!(style instanceof TerrainRenderStyle)) {
      return;
    }
    const { grid } = this;
    if (grid === undefined) {
      return;
    }
    const { boundingBox } = grid;
    const zRange = boundingBox.z;
    if (zRange.isEmpty || !zRange.hasSpan) {
      return;
    }
    if (
      style.increment <= 0 ||
      style.increment > zRange.delta ||
      style.increment < zRange.delta / 200
    ) {
      style.increment = zRange.getBestInc();
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new TerrainThreeView();
  }
}
