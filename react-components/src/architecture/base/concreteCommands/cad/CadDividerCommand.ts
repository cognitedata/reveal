import { CadDomainObject } from '../../../concrete/reveal/cad/CadDomainObject';
import { DividerCommand } from '../../commands/DividerCommand';

export class CadDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.rootDomainObject.getDescendantsByType(CadDomainObject) !== undefined;
  }
}
