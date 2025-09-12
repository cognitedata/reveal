import { Image360CollectionDomainObject } from '../Image360CollectionDomainObject';
import { DividerCommand } from '../../../../base/commands/DividerCommand';

export class Image360CollectionDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.root.getDescendantByType(Image360CollectionDomainObject) !== undefined;
  }
}
