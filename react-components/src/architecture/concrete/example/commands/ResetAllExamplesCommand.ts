import { ExampleDomainObject } from '../ExampleDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { InstanceCommand } from '../../../base/commands/InstanceCommand';
import { type IconName } from '../../../base/utilities/IconName';

export class ResetAllExamplesCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Reset the visual style for all examples to default' };
  }

  public override get icon(): IconName {
    return 'ClearAll';
  }

  protected override invokeCore(): boolean {
    for (const domainObject of this.getInstances()) {
      this.addTransaction(domainObject.createTransaction(Changes.renderStyle));
      domainObject.setRenderStyle(undefined);
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
