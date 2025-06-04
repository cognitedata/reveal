import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type IconName } from '../../base/utilities/IconName';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { AxisRenderStyle } from './AxisRenderStyle';

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

  public override get hasIconColor(): boolean {
    return false;
  }

  public override get hasIndexOnLabel(): boolean {
    return false;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new AxisRenderStyle();
  }
}
