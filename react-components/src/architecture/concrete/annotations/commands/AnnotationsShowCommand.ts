import { ShowAllDomainObjectsCommand } from '../../../base/commands/ShowAllDomainObjectsCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { isAnnotationsOrGizmo } from './isGizmo';

export class AnnotationsShowCommand extends ShowAllDomainObjectsCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Show or hide annotations.' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return isAnnotationsOrGizmo(domainObject);
  }
}
