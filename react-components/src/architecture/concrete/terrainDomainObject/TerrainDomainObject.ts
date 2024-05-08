/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { TerrainRenderStyle } from './TerrainRenderStyle';
import { type RegularGrid2 } from '../../../../RegularGrid2';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
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
    // The rest checks if the increment is valid. To many contour lines with hang/crash the app.
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
      style.increment <= 0 || // Not set
      style.increment > zRange.delta || // Too large
      style.increment < zRange.delta / 200 // Too small
    ) {
      style.increment = zRange.getBestInc(20);
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new TerrainThreeView();
  }
}
