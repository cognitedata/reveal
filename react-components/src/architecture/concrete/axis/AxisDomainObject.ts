/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { AxisRenderStyle } from './AxisRenderStyle';
import { AxisThreeView } from './AxisThreeView';

export class AxisDomainObject extends VisualDomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public override get typeName(): string {
    return 'Axis';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new AxisRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new AxisThreeView();
  }
}
