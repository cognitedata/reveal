import { type IconName, type ButtonType } from '../../../base/utilities/types';
import { InstanceCommand } from '../../../base/commands/InstanceCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class DeleteAllExamplesCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Remove all examples' };
  }

  public override get icon(): IconName {
    return 'Delete';
  }

  public override get buttonType(): ButtonType {
    return 'ghost-destructive';
  }

  public override get isEnabled(): boolean {
    const first = this.getFirstInstance();
    return first !== undefined && first.canBeRemoved;
  }

  protected override invokeCore(): boolean {
    const array = Array.from(this.getInstances());
    array.reverse();
    for (const domainObject of array) {
      this.addTransaction(domainObject.createTransaction(Changes.deleted));
      domainObject.removeInteractive();
    }
    return true;
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
