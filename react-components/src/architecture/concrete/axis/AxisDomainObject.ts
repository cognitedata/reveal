/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type IconName } from '../../base/utilities/IconName';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { type ThreeView } from '../../base/views/ThreeView';
import { AxisRenderStyle } from './AxisRenderStyle';
import { AxisThreeView } from './AxisThreeView';

export class AxisDomainObject extends VisualDomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { untranslated: 'Axis' };
  }

  public override get icon(): IconName {
    return 'Axis3D';
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
