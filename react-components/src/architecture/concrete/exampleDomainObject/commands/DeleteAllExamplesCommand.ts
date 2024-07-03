/*!
 * Copyright 2024 Cognite AS
 */

import { IconName } from '../../../../components/Architecture/getIconComponent';
import { InstanceCommand } from '../../../base/commands/InstanceCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class DeleteAllExamplesCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Remove all examples' };
  }

  public override get icon(): IconName {
    return 'Delete';
  }

  public override get buttonType(): string {
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
