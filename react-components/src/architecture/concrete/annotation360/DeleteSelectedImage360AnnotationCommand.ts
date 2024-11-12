/*!
 * Copyright 2024 Cognite AS
 */

import { InstanceCommand } from '../../base/commands/InstanceCommand';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type IconName } from '../../base/utilities/IconName';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';

export class DeleteSelectedImage360AnnotationCommand extends InstanceCommand {
  public override get tooltip(): TranslateKey {
    return { fallback: 'Remove selected polygon' };
  }

  public override get icon(): IconName {
    return 'Delete';
  }

  public override get buttonType(): string {
    return 'ghost-destructive';
  }

  public override get isEnabled(): boolean {
    const first = this.getSelectedInstances().next().value;
    return first !== undefined && first.canBeRemoved;
  }

  protected override invokeCore(): boolean {
    const array = Array.from(this.getSelectedInstances());
    array.reverse();
    for (const domainObject of array) {
      this.addTransaction(domainObject.createTransaction(Changes.deleted));
      domainObject.removeInteractive();
    }
    return true;
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof Image360AnnotationDomainObject;
  }
}
