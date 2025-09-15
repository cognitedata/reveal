import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { type DomainObject } from '../../domainObjects/DomainObject';
import { DomainObjectCommand } from '../../commands/DomainObjectCommand';
import { Changes } from '../../domainObjectsHelpers/Changes';
import { type ButtonType, type IconName } from '../../utilities/types';

export class DeleteDomainObjectCommand extends DomainObjectCommand<DomainObject> {
  public override get tooltip(): TranslationInput {
    return { key: 'DELETE' };
  }

  public override get icon(): IconName {
    return 'Delete';
  }

  public override get buttonType(): ButtonType {
    return 'ghost-destructive';
  }

  public override get isEnabled(): boolean {
    return this._domainObject.canBeRemoved;
  }

  protected override invokeCore(): boolean {
    this.addTransaction(this._domainObject.createTransaction(Changes.deleted));
    return this._domainObject.removeInteractive();
  }
}
