/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { TerrainRenderStyle } from './TerrainRenderStyle';
import { type RegularGrid2 } from './geometry/RegularGrid2';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { TerrainThreeView } from './TerrainThreeView';
import { type TranslationInput } from '../../base/utilities/TranslateInput';

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

  public override get typeName(): TranslationInput {
    return { untranslated: 'Terrain' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new TerrainRenderStyle();
  }

  public override verifyRenderStyle(style: RenderStyle): void {
    if (!(style instanceof TerrainRenderStyle)) {
      return;
    }
    // The rest checks if the increment is valid.
    // Too many contour lines with hang/crash the app, so it recalculate
    // its value if it is not set or too large/small.
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
      style.increment = zRange.getBestIncrement(20);
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new TerrainThreeView();
  }
}
