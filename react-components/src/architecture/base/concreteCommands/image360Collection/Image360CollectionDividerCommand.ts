import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { DividerCommand } from '../../commands/DividerCommand';

export class Image360CollectionDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.rootDomainObject.getDescendantByType(Image360CollectionDomainObject) !== undefined;
  }
}
