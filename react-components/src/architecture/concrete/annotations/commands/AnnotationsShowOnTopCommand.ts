import { ShowDomainObjectsOnTopCommand } from '../../../base/commands/ShowDomainObjectsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { isAnnotationsOrGizmo } from './isGizmo';

export class AnnotationsShowOnTopCommand extends ShowDomainObjectsOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Show all annotations on top.' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return isAnnotationsOrGizmo(domainObject);
  }
}
