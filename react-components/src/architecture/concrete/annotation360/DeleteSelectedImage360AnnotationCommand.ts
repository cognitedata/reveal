/*!
 * Copyright 2024 Cognite AS
 */

import { InstanceCommand } from '../../base/commands/InstanceCommand';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { type IconName } from '../../base/utilities/IconName';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';

export class DeleteSelectedImage360AnnotationCommand extends InstanceCommand {
  public override get tooltip(): TranslationInput {
    return { untranslated: 'Remove selected polygon' };
  }

  public override get icon(): IconName {
    return 'Delete';
  }

  public override get buttonType(): string {
    return 'ghost-destructive';
  }

  public override get shortCutKey(): string {
    return 'DEL';
  }

  public override get isEnabled(): boolean {
    return this.getFirstInstance() !== undefined;
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
    return (
      domainObject instanceof Image360AnnotationDomainObject &&
      domainObject.isSelected &&
      domainObject.focusType !== FocusType.Pending
    );
  }
}
