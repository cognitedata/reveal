import { ShowDomainObjectsOnTopCommand } from '../../../base/commands/ShowDomainObjectsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class ShowExamplesOnTopCommand extends ShowDomainObjectsOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Show all examples on top' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
